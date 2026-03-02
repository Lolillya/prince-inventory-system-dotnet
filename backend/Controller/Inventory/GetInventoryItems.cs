
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Controller.Inventory
{
    [Route("api/inventory/")]
    [ApiController]
    public class GetInventoryItems : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetInventoryItems(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllInventoryProducts()
        {
            try
            {
                var results = await _db.Inventory
                    .Include(i => i.Product)
                        .ThenInclude(p => p.Variant)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.Brand)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.Category)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.ProductPresets)
                            .ThenInclude(pp => pp.Preset)
                                .ThenInclude(preset => preset.PresetLevels)
                                    .ThenInclude(level => level.UnitOfMeasure)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.ProductPresets)
                            .ThenInclude(pp => pp.PresetPricing)
                                .ThenInclude(pricing => pricing.UnitOfMeasure)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.ProductPresets)
                            .ThenInclude(pp => pp.PresetQuantities)
                                .ThenInclude(qty => qty.UnitOfMeasure)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.RestockLineItems)
                            .ThenInclude(rli => rli.RestockBatch)
                                .ThenInclude(rb => rb.Supplier)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.RestockLineItems)
                            .ThenInclude(rli => rli.RestockBatch)
                                .ThenInclude(rb => rb.Restock)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.RestockLineItems)
                            .ThenInclude(rli => rli.BaseUnitOfMeasure)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.RestockLineItems)
                            .ThenInclude(rli => rli.ProductUOMs)
                                .ThenInclude(puom => puom.UnitOfMeasure)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.RestockLineItems)
                            .ThenInclude(rli => rli.ProductUOMs)
                                .ThenInclude(puom => puom.ParentUnitOfMeasure)
                    .Select(i => new
                    {
                        Product = new
                        {
                            Quantity = i.Total_Quantity,
                            i.Product_ID,
                            i.Product.Product_Code,
                            i.Product.Product_Name,
                            i.Product.Description,
                            CreatedAt = i.Created_At,
                            UpdatedAt = i.Updated_At
                        },
                        Variant = new
                        {
                            i.Product.Variant.Variant_ID,
                            i.Product.Variant.Variant_Name,
                            i.Product.Variant.CreatedAt,
                            i.Product.Variant.UpdatedAt
                        },
                        Brand = new
                        {
                            i.Product.Brand.Brand_ID,
                            i.Product.Brand.BrandName,
                            i.Product.Brand.CreatedAt,
                            i.Product.Brand.UpdatedAt
                        },
                        Category = new
                        {
                            i.Product.Category.Category_ID,
                            i.Product.Category.Category_Name,
                            i.Product.Category.CreatedAt,
                            i.Product.Category.UpdatedAt
                        },
                        UnitPresets = _db.Product_Unit_Presets
                            .Where(pup => pup.Product_ID == i.Product_ID)
                            .Select(pup => new
                            {
                                pup.Product_Preset_ID,
                                pup.Preset_ID,
                                pup.Assigned_At,
                                pup.Low_Stock_Level,
                                pup.Very_Low_Stock_Level,
                                pup.Main_Unit_Quantity,
                                Preset = new
                                {
                                    pup.Preset.Preset_ID,
                                    pup.Preset.Preset_Name,
                                    pup.Preset.Main_Unit_ID,
                                    pup.Preset.Created_At,
                                    pup.Preset.Updated_At,
                                    PresetLevels = pup.Preset.PresetLevels.Select(level => new
                                    {
                                        level.Level_ID,
                                        level.UOM_ID,
                                        level.Level,
                                        level.Conversion_Factor,
                                        level.Created_At,
                                        UnitOfMeasure = new
                                        {
                                            level.UnitOfMeasure.uom_ID,
                                            level.UnitOfMeasure.uom_Name
                                        }
                                    }).OrderBy(l => l.Level).ToList()
                                },
                                PresetPricing = pup.PresetPricing.Select(pricing => new
                                {
                                    pricing.Pricing_ID,
                                    pricing.Level,
                                    pricing.UOM_ID,
                                    UnitName = pricing.UnitOfMeasure.uom_Name,
                                    pricing.Price_Per_Unit,
                                    pricing.Created_At,
                                    pricing.Updated_At
                                }).OrderBy(p => p.Level).ToList(),
                                PresetQuantities = pup.PresetQuantities.Select(qty => new
                                {
                                    qty.Quantity_ID,
                                    qty.Level,
                                    qty.UOM_ID,
                                    UnitName = qty.UnitOfMeasure.uom_Name,
                                    qty.Original_Quantity,
                                    qty.Remaining_Quantity,
                                    qty.Created_At,
                                    qty.Updated_At
                                }).OrderBy(q => q.Level).ToList()
                            }).ToList(),



                        IsComplete = _db.Product_Unit_Presets.Any(pup => pup.Product_ID == i.Product_ID)
                    }).ToListAsync();

                if (results == null || !results.Any())
                {
                    return NotFound("No inventory products found.");
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}