using System;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos.RestockModel;
using backend.Models.RestockModel;
using backend.Models.LineItems;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models.Unit;

namespace backend.Controller.RestockControllers
{
    [ApiController]
    [Route("api/restock/unit-preset")]
    public class CreateUnitPresetRestockController : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public CreateUnitPresetRestockController(ApplicationDBContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Creates a new restock using unit preset configuration
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateUnitPresetRestock([FromBody] UnitPresetRestockDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (dto.LineItems == null || dto.LineItems.Count == 0)
            {
                return BadRequest("At least one line item is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.Supplier_ID))
            {
                return BadRequest("Supplier_ID is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.Restock_Clerk))
            {
                return BadRequest("Restock_Clerk is required.");
            }

            var supplierExists = await _db.Users.AnyAsync(u => u.Id == dto.Supplier_ID);
            if (!supplierExists)
            {
                return BadRequest($"Supplier with id '{dto.Supplier_ID}' was not found.");
            }

            var clerkExists = await _db.Users.AnyAsync(u => u.Id == dto.Restock_Clerk);
            if (!clerkExists)
            {
                return BadRequest($"Restock clerk with id '{dto.Restock_Clerk}' was not found.");
            }

            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                // Generate restock number
                var restockCount = await _db.Restocks.CountAsync();
                var restockNumber = $"RS-{DateTime.UtcNow:yyyy}-{(restockCount + 1):D6}";

                // Create Restock
                var restock = new Restock
                {
                    Restock_Number = restockNumber,
                    Restock_Clerk = dto.Restock_Clerk,
                    Restock_Notes = dto.Notes,
                    Status = "COMPLETE",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _db.Restocks.Add(restock);
                await _db.SaveChangesAsync();

                // Create RestockBatch
                var batch = new RestockBatch
                {
                    Restock_ID = restock.Restock_ID,
                    Supplier_ID = dto.Supplier_ID,
                    Batch_Number = 1,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _db.RestockBatches.Add(batch);
                await _db.SaveChangesAsync();

                // Process each line item
                foreach (var lineItemDto in dto.LineItems)
                {
                    if (lineItemDto.LevelPricing == null || lineItemDto.LevelPricing.Count == 0)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest($"Line item for product {lineItemDto.Product_ID} must include level pricing.");
                    }

                    // Verify preset exists and belongs to product
                    var productPreset = await _db.Product_Unit_Presets
                        .Include(pp => pp.Preset)
                            .ThenInclude(p => p.PresetLevels)
                        .FirstOrDefaultAsync(pp =>
                            pp.Product_ID == lineItemDto.Product_ID &&
                            pp.Preset_ID == lineItemDto.Preset_ID);

                    if (productPreset == null)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest($"Product {lineItemDto.Product_ID} does not have preset {lineItemDto.Preset_ID}");
                    }

                    // Get the main unit (Level 1)
                    var mainLevel = productPreset.Preset.PresetLevels
                        .FirstOrDefault(pl => pl.Level == 1);

                    if (mainLevel == null)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest($"Preset {lineItemDto.Preset_ID} does not have a main unit (Level 1)");
                    }

                    var presetLevelsByLevel = productPreset.Preset.PresetLevels
                        .ToDictionary(pl => pl.Level, pl => pl);

                    foreach (var pricing in lineItemDto.LevelPricing)
                    {
                        if (!presetLevelsByLevel.TryGetValue(pricing.Level, out var levelConfig))
                        {
                            await transaction.RollbackAsync();
                            return BadRequest($"Preset {lineItemDto.Preset_ID} does not define level {pricing.Level}.");
                        }

                        if (pricing.UOM_ID != levelConfig.UOM_ID)
                        {
                            await transaction.RollbackAsync();
                            return BadRequest($"Invalid UOM_ID {pricing.UOM_ID} for preset {lineItemDto.Preset_ID} level {pricing.Level}. Expected {levelConfig.UOM_ID}.");
                        }
                    }

                    // Get the price for the main unit
                    var mainUnitPrice = lineItemDto.LevelPricing
                        .FirstOrDefault(lp => lp.Level == 1)?.Price_Per_Unit ?? 0;

                    // Create RestockLineItem
                    var lineItem = new RestockLineItems
                    {
                        Product_ID = lineItemDto.Product_ID,
                        Batch_ID = batch.Batch_ID,
                        Base_UOM_ID = mainLevel.UOM_ID,
                        Preset_ID = lineItemDto.Preset_ID,
                        Base_Unit_Price = mainUnitPrice,
                        Base_Unit_Quantity = lineItemDto.Main_Unit_Quantity
                    };

                    _db.RestockLineItems.Add(lineItem);
                    await _db.SaveChangesAsync();

                    // Store pricing for each level
                    foreach (var pricing in lineItemDto.LevelPricing)
                    {
                        var presetPricing = new RestockLineItem_PresetPricing
                        {
                            LineItem_ID = lineItem.LineItem_ID,
                            Level = pricing.Level,
                            UOM_ID = pricing.UOM_ID,
                            Price_Per_Unit = pricing.Price_Per_Unit,
                            Created_At = DateTime.UtcNow
                        };

                        _db.RestockLineItem_PresetPricing.Add(presetPricing);
                    }

                    await _db.SaveChangesAsync();

                    // Update inventory
                    var inventory = await _db.Inventory
                        .FirstOrDefaultAsync(i => i.Product_ID == lineItemDto.Product_ID);

                    if (inventory != null)
                    {
                        inventory.Total_Quantity += lineItemDto.Main_Unit_Quantity;
                        inventory.Updated_At = DateTime.UtcNow;
                        _db.Inventory.Update(inventory);
                    }
                    else
                    {
                        // Create new inventory entry
                        var inventoryCount = await _db.Inventory.CountAsync();
                        inventory = new backend.Models.Inventory.Inventory
                        {
                            Product_ID = lineItemDto.Product_ID,
                            Total_Quantity = lineItemDto.Main_Unit_Quantity,
                            Inventory_Number = inventoryCount + 1,
                            Created_At = DateTime.UtcNow,
                            Updated_At = DateTime.UtcNow
                        };
                        _db.Inventory.Add(inventory);
                    }

                    await _db.SaveChangesAsync();

                    // Update Product_Unit_Preset.Main_Unit_Quantity
                    productPreset.Main_Unit_Quantity += lineItemDto.Main_Unit_Quantity;
                    _db.Product_Unit_Presets.Update(productPreset);
                    await _db.SaveChangesAsync();

                    // Update Product_Unit_Preset_Quantity for main level only
                    var presetLevels = productPreset.Preset.PresetLevels
                        .OrderBy(pl => pl.Level)
                        .ToList();

                    // Prefer main level (Level 1); fallback to highest level if main is not configured.
                    var targetLevel = presetLevels.FirstOrDefault(pl => pl.Level == 1)
                        ?? presetLevels.Last();

                    var quantityRecord = await _db.Product_Unit_Preset_Quantities
                        .FirstOrDefaultAsync(q =>
                            q.Product_Preset_ID == productPreset.Product_Preset_ID &&
                            q.Level == targetLevel.Level);

                    if (quantityRecord != null)
                    {
                        // Update only the selected level quantity.
                        quantityRecord.Original_Quantity += lineItemDto.Main_Unit_Quantity;
                        quantityRecord.Remaining_Quantity += lineItemDto.Main_Unit_Quantity;
                        quantityRecord.Updated_At = DateTime.UtcNow;
                        _db.Product_Unit_Preset_Quantities.Update(quantityRecord);
                    }
                    else
                    {
                        // Create quantity record only for the selected level.
                        quantityRecord = new Product_Unit_Preset_Quantity
                        {
                            Product_Preset_ID = productPreset.Product_Preset_ID,
                            Level = targetLevel.Level,
                            UOM_ID = targetLevel.UOM_ID,
                            Original_Quantity = lineItemDto.Main_Unit_Quantity,
                            Remaining_Quantity = lineItemDto.Main_Unit_Quantity,
                            Created_At = DateTime.UtcNow,
                            Updated_At = DateTime.UtcNow
                        };
                        _db.Product_Unit_Preset_Quantities.Add(quantityRecord);
                    }

                    await _db.SaveChangesAsync();
                }

                await transaction.CommitAsync();

                return Ok(new
                {
                    Message = "Restock created successfully",
                    Restock_Number = restockNumber,
                    Restock_ID = restock.Restock_ID
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                var inner = ex.InnerException?.Message;
                var detail = string.IsNullOrWhiteSpace(inner)
                    ? ex.Message
                    : $"{ex.Message} | Inner: {inner}";

                return StatusCode(500, $"Error creating restock: {detail}");
            }
        }
    }
}
