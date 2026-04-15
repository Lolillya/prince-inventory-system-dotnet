using backend.Data;
using backend.Dtos.RestockModel;
using backend.Models.LineItems;
using backend.Models.RestockModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.RestockControllers
{
    [ApiController]
    [Route("api/restock/po-restock")]
    public class CreatePORestockController : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public CreatePORestockController(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> CreatePORestock([FromBody] PORestockCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.LineItems == null || dto.LineItems.Count == 0)
                return BadRequest("At least one line item is required.");

            var normalizedDeliveryStatus = dto.Delivery_Status?.Trim().ToUpperInvariant();
            if (normalizedDeliveryStatus != "PARTIAL" && normalizedDeliveryStatus != "FULLY_DELIVERED")
                return BadRequest("Delivery_Status must be PARTIAL or FULLY_DELIVERED.");

            var purchaseOrder = await _db.PurchaseOrders
                .Include(po => po.LineItems)
                .FirstOrDefaultAsync(po => po.Purchase_Order_ID == dto.Purchase_Order_ID);

            if (purchaseOrder == null)
                return NotFound($"Purchase order '{dto.Purchase_Order_ID}' not found.");

            var eligibleStatuses = new[] { "NOT_DELIVERED", "PARTIAL" };
            if (!eligibleStatuses.Contains(purchaseOrder.Status))
                return BadRequest($"Purchase order is not eligible for restock. Current status: {purchaseOrder.Status}");

            var clerkExists = await _db.Users.AnyAsync(u => u.Id == dto.Restock_Clerk);
            if (!clerkExists)
                return BadRequest($"Restock clerk with id '{dto.Restock_Clerk}' was not found.");

            // Only process line items with quantity > 0
            var activeLineItems = dto.LineItems.Where(li => li.Main_Unit_Quantity > 0).ToList();
            if (activeLineItems.Count == 0)
                return BadRequest("At least one line item must have a quantity greater than 0.");

            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                var restockCount = await _db.Restocks.CountAsync();
                var restockNumber = $"RS-{DateTime.UtcNow:yyyy}-{(restockCount + 1):D6}";

                var restock = new Restock
                {
                    Restock_Number = restockNumber,
                    Restock_Clerk = dto.Restock_Clerk,
                    Restock_Notes = dto.Notes,
                    Purchase_Order_ID = dto.Purchase_Order_ID,
                    Status = "COMPLETE",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

                _db.Restocks.Add(restock);
                await _db.SaveChangesAsync();

                var batch = new RestockBatch
                {
                    Restock_ID = restock.Restock_ID,
                    Supplier_ID = purchaseOrder.Supplier_ID,
                    Batch_Number = 1,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

                _db.RestockBatches.Add(batch);
                await _db.SaveChangesAsync();

                foreach (var lineItemDto in activeLineItems)
                {
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

                    var mainLevel = productPreset.Preset.PresetLevels.FirstOrDefault(pl => pl.Level == 1);
                    if (mainLevel == null)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest($"Preset {lineItemDto.Preset_ID} does not have a main unit (Level 1)");
                    }

                    // Use unit price from original PO line item
                    var poLineItem = purchaseOrder.LineItems
                        .FirstOrDefault(li => li.Product_ID == lineItemDto.Product_ID);
                    var unitPrice = poLineItem?.Unit_Price ?? 0m;

                    var lineItem = new RestockLineItems
                    {
                        Product_ID = lineItemDto.Product_ID,
                        Batch_ID = batch.Batch_ID,
                        Base_UOM_ID = mainLevel.UOM_ID,
                        Preset_ID = lineItemDto.Preset_ID,
                        Base_Unit_Price = unitPrice,
                        Base_Unit_Quantity = lineItemDto.Main_Unit_Quantity,
                    };

                    _db.RestockLineItems.Add(lineItem);
                    await _db.SaveChangesAsync();

                    // Create level 1 pricing from PO unit price
                    var presetPricing = new RestockLineItem_PresetPricing
                    {
                        LineItem_ID = lineItem.LineItem_ID,
                        Level = 1,
                        UOM_ID = mainLevel.UOM_ID,
                        Price_Per_Unit = unitPrice,
                        Created_At = DateTime.UtcNow,
                    };

                    _db.RestockLineItem_PresetPricing.Add(presetPricing);
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
                        var inventoryCount = await _db.Inventory.CountAsync();
                        _db.Inventory.Add(new backend.Models.Inventory.Inventory
                        {
                            Product_ID = lineItemDto.Product_ID,
                            Total_Quantity = lineItemDto.Main_Unit_Quantity,
                            Inventory_Number = inventoryCount + 1,
                            Created_At = DateTime.UtcNow,
                            Updated_At = DateTime.UtcNow,
                        });
                    }

                    await _db.SaveChangesAsync();
                }

                // Update PO status
                purchaseOrder.Status = normalizedDeliveryStatus!;
                purchaseOrder.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "PO Restock created successfully.",
                    restock_id = restock.Restock_ID,
                    restock_number = restock.Restock_Number,
                    purchase_order_id = dto.Purchase_Order_ID,
                    delivery_status = purchaseOrder.Status,
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Failed to create PO restock: {ex.Message}");
            }
        }
    }
}
