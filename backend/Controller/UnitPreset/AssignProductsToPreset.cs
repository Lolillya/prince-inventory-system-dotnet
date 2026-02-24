using backend.Data;
using backend.Dtos.UnitPreset;
using backend.Models.Unit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.UnitPreset
{
    [ApiController]
    [Route("api/unit-presets/assign-products")]
    public class AssignProductsToPreset : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public AssignProductsToPreset(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> Assign([FromBody] AssignProductsToPresetDto dto)
        {
            if (dto.Product_IDs == null || !dto.Product_IDs.Any())
            {
                return BadRequest("At least one product ID is required");
            }

            await using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                // Load preset with levels to get UOM information
                var preset = await _db.Unit_Presets
                    .Include(p => p.PresetLevels)
                        .ThenInclude(pl => pl.UnitOfMeasure)
                    .FirstOrDefaultAsync(p => p.Preset_ID == dto.Preset_ID);

                if (preset == null)
                {
                    return NotFound($"Preset with ID {dto.Preset_ID} not found");
                }

                // Get existing assignments to avoid duplicates
                var existingAssignments = await _db.Product_Unit_Presets
                    .Where(p => p.Preset_ID == dto.Preset_ID && dto.Product_IDs.Contains(p.Product_ID))
                    .Select(p => p.Product_ID)
                    .ToListAsync();

                var newProductIds = dto.Product_IDs.Except(existingAssignments).ToList();
                int assignedCount = 0;

                foreach (var productId in newProductIds)
                {
                    var productExists = await _db.Products.AnyAsync(p => p.Product_ID == productId);
                    if (!productExists)
                    {
                        return NotFound($"Product with ID {productId} not found");
                    }

                    var assignment = new Product_Unit_Preset
                    {
                        Product_ID = productId,
                        Preset_ID = dto.Preset_ID,
                        Assigned_At = DateTime.UtcNow
                    };

                    await _db.Product_Unit_Presets.AddAsync(assignment);
                    await _db.SaveChangesAsync(); // Save to get the Product_Preset_ID

                    // Save pricing data if provided
                    if (dto.PricingData != null && dto.PricingData.Any())
                    {
                        var productPricing = dto.PricingData.FirstOrDefault(pd => pd.Product_ID == productId);

                        if (productPricing != null && productPricing.UnitPrices.Any())
                        {
                            foreach (var unitPrice in productPricing.UnitPrices)
                            {
                                // Find the corresponding preset level by unit name
                                var presetLevel = preset.PresetLevels
                                    .FirstOrDefault(pl => pl.UnitOfMeasure.uom_Name.Equals(unitPrice.UnitName, StringComparison.OrdinalIgnoreCase));

                                if (presetLevel != null)
                                {
                                    var pricing = new Product_Unit_Preset_Pricing
                                    {
                                        Product_Preset_ID = assignment.Product_Preset_ID,
                                        Level = presetLevel.Level,
                                        UOM_ID = presetLevel.UOM_ID,
                                        Price_Per_Unit = unitPrice.Price,
                                        Created_At = DateTime.UtcNow,
                                        Updated_At = DateTime.UtcNow
                                    };

                                    await _db.Product_Unit_Preset_Pricing.AddAsync(pricing);
                                }
                            }
                        }
                    }

                    assignedCount++;
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Products assigned successfully",
                    assigned_count = assignedCount,
                    skipped_count = existingAssignments.Count
                });
            }
            catch (Exception e)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}
