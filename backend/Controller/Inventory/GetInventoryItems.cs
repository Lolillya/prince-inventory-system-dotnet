
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.Inventory;

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
                    .Select(i => new
                    {
                        Product = new
                        {
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
                        UnitPresets = i.Product.ProductPresets.Select(pp => new
                        {
                            pp.Product_Preset_ID,
                            pp.Preset_ID,
                            pp.Assigned_At,
                            pp.Low_Stock_Level,
                            pp.Very_Low_Stock_Level,
                            Preset = new
                            {
                                pp.Preset.Preset_ID,
                                pp.Preset.Preset_Name,
                                pp.Preset.Main_Unit_ID,
                                pp.Preset.Created_At,
                                pp.Preset.Updated_At,
                                PresetLevels = pp.Preset.PresetLevels.Select(level => new
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
                            }
                        }).ToList(),
                        IsComplete = i.Product.ProductPresets.Any()
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