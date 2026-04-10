using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.Inventory
{
    [ApiController]
    [Route("api/products")]
    public class GetProductsWithPresets : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetProductsWithPresets(ApplicationDBContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Returns all products that have at least one packaging preset assigned,
        /// including each preset's main unit selling price from Product_Unit_Preset_Pricing.
        /// </summary>
        [HttpGet("with-presets")]
        public async Task<IActionResult> GetWithPresets()
        {
            // Get IDs of products that have at least one preset assigned
            var productIdsWithPresets = await _db.Product_Unit_Presets
                .Select(pup => pup.Product_ID)
                .Distinct()
                .ToListAsync();

            if (productIdsWithPresets.Count == 0)
                return Ok(new List<object>());

            // Fetch those products
            var products = await _db.Products
                .Where(p => productIdsWithPresets.Contains(p.Product_ID))
                .OrderBy(p => p.Product_Name)
                .Select(product => new
                {
                    product_ID = product.Product_ID,
                    product_Name = product.Product_Name,
                    product_Code = product.Product_Code,
                    presets = _db.Product_Unit_Presets
                        .Where(pup => pup.Product_ID == product.Product_ID)
                        .Select(pup => new
                        {
                            product_Preset_ID = pup.Product_Preset_ID,
                            preset_ID = pup.Preset_ID,
                            preset_Name = pup.Preset.Preset_Name,
                            main_Unit_ID = pup.Preset.Main_Unit_ID,
                            main_Unit = pup.Preset.MainUnit != null
                                ? new
                                {
                                    pup.Preset.MainUnit.uom_ID,
                                    pup.Preset.MainUnit.uom_Name
                                }
                                : null,
                            preset_Levels = pup.Preset.PresetLevels
                                .OrderBy(pl => pl.Level)
                                .Select(pl => new
                                {
                                    pl.Level_ID,
                                    pl.Level,
                                    pl.UOM_ID,
                                    pl.Conversion_Factor,
                                    unit = pl.UnitOfMeasure != null
                                        ? new
                                        {
                                            pl.UnitOfMeasure.uom_ID,
                                            pl.UnitOfMeasure.uom_Name
                                        }
                                        : null,
                                    selling_Price = _db.Product_Unit_Preset_Pricing
                                        .Where(pp =>
                                            pp.ProductUnitPreset.Product_ID == product.Product_ID &&
                                            pp.ProductUnitPreset.Preset_ID == pup.Preset_ID &&
                                            pp.UOM_ID == pl.UOM_ID)
                                        .Select(pp => (decimal?)pp.Price_Per_Unit)
                                        .FirstOrDefault() ?? 0m
                                })
                                .ToList(),
                            // Selling price for the preset's main unit from global preset pricing
                            main_Unit_Selling_Price = _db.Product_Unit_Preset_Pricing
                                .Where(pp =>
                                    pp.ProductUnitPreset.Product_ID == product.Product_ID &&
                                    pp.ProductUnitPreset.Preset_ID == pup.Preset_ID &&
                                    pp.UOM_ID == pup.Preset.Main_Unit_ID)
                                .Select(pp => (decimal?)pp.Price_Per_Unit)
                                .FirstOrDefault() ?? 0m
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(products);
        }
    }
}
