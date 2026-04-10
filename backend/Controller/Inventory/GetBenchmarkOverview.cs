using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.Inventory
{
    [ApiController]
    [Route("api/benchmark")]
    public class GetBenchmarkOverview : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetBenchmarkOverview(ApplicationDBContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Returns products that have at least one preset with at least one supplier purchase price.
        /// Includes preset_Levels with selling prices, supplier_count, and has_loss per preset.
        /// </summary>
        [HttpGet("products")]
        public async Task<IActionResult> GetBenchmarkProducts()
        {
            // Step 1: Get supplier price stats per (Product_ID, Preset_ID)
            var supplierStats = await _db.SupplierProductPresetPrices
                .GroupBy(sp => new { sp.Product_ID, sp.Preset_ID })
                .Select(g => new
                {
                    g.Key.Product_ID,
                    g.Key.Preset_ID,
                    supplier_count = g.Count(),
                    min_price = g.Min(sp => sp.Price_Per_Unit)
                })
                .ToListAsync();

            if (supplierStats.Count == 0)
                return Ok(new List<object>());

            var productIds = supplierStats.Select(s => s.Product_ID).Distinct().ToList();
            var validPresetIds = supplierStats.Select(s => s.Preset_ID).Distinct().ToList();

            var statsDict = supplierStats.ToDictionary(
                s => $"{s.Product_ID}:{s.Preset_ID}",
                s => new { s.supplier_count, s.min_price }
            );

            // Step 2: Fetch product + preset data (levels + selling prices)
            var products = await _db.Products
                .Where(p => productIds.Contains(p.Product_ID))
                .OrderBy(p => p.Product_Name)
                .Select(product => new
                {
                    product_ID = product.Product_ID,
                    product_Name = product.Product_Name,
                    product_Code = product.Product_Code,
                    presets = _db.Product_Unit_Presets
                        .Where(pup =>
                            pup.Product_ID == product.Product_ID &&
                            validPresetIds.Contains(pup.Preset_ID))
                        .Select(pup => new
                        {
                            product_Preset_ID = pup.Product_Preset_ID,
                            preset_ID = pup.Preset_ID,
                            preset_Name = pup.Preset.Preset_Name,
                            main_Unit_ID = pup.Preset.Main_Unit_ID,
                            main_Unit = pup.Preset.MainUnit != null
                                ? new { pup.Preset.MainUnit.uom_ID, pup.Preset.MainUnit.uom_Name }
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
                                        ? new { pl.UnitOfMeasure.uom_ID, pl.UnitOfMeasure.uom_Name }
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

            // Step 3: Merge with stats, compute has_loss, filter to only valid pairs
            var result = products
                .Select(product => new
                {
                    product.product_ID,
                    product.product_Name,
                    product.product_Code,
                    presets = product.presets
                        .Where(p => statsDict.ContainsKey($"{product.product_ID}:{p.preset_ID}"))
                        .Select(p =>
                        {
                            var stats = statsDict[$"{product.product_ID}:{p.preset_ID}"];
                            return new
                            {
                                p.product_Preset_ID,
                                p.preset_ID,
                                p.preset_Name,
                                p.main_Unit_ID,
                                p.main_Unit,
                                p.preset_Levels,
                                p.main_Unit_Selling_Price,
                                supplier_count = stats.supplier_count,
                                has_loss = stats.min_price >= p.main_Unit_Selling_Price
                            };
                        })
                        .ToList()
                })
                .Where(p => p.presets.Count > 0)
                .ToList();

            return Ok(result);
        }
    }
}
