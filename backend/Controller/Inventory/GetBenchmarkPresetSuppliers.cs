using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.Inventory
{
    [ApiController]
    [Route("api/benchmark")]
    public class GetBenchmarkPresetSuppliers : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetBenchmarkPresetSuppliers(ApplicationDBContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Returns all supplier purchase prices for a specific product+preset combination,
        /// along with the preset's level data for sub-unit breakdown.
        /// </summary>
        [HttpGet("products/{productId}/presets/{presetId}/suppliers")]
        public async Task<IActionResult> GetPresetSuppliers(int productId, int presetId)
        {
            var presetInfo = await _db.Product_Unit_Presets
                .Where(pup => pup.Product_ID == productId && pup.Preset_ID == presetId)
                .Select(pup => new
                {
                    pup.Preset.Main_Unit_ID,
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
                                    pp.ProductUnitPreset.Product_ID == productId &&
                                    pp.ProductUnitPreset.Preset_ID == presetId &&
                                    pp.UOM_ID == pl.UOM_ID)
                                .Select(pp => (decimal?)pp.Price_Per_Unit)
                                .FirstOrDefault() ?? 0m
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (presetInfo == null)
                return NotFound($"No preset {presetId} found for product {productId}.");

            var mainUnitSellingPrice = await _db.Product_Unit_Preset_Pricing
                .Where(pp =>
                    pp.ProductUnitPreset.Product_ID == productId &&
                    pp.ProductUnitPreset.Preset_ID == presetId &&
                    pp.UOM_ID == presetInfo.Main_Unit_ID)
                .Select(pp => (decimal?)pp.Price_Per_Unit)
                .FirstOrDefaultAsync() ?? 0m;

            var suppliers = await _db.SupplierProductPresetPrices
                .Where(sp => sp.Product_ID == productId && sp.Preset_ID == presetId)
                .OrderBy(sp => sp.Supplier.CompanyName)
                .Select(sp => new
                {
                    sp.Supplier_ID,
                    supplier_Name = sp.Supplier.CompanyName != null && sp.Supplier.CompanyName != ""
                        ? sp.Supplier.CompanyName
                        : (sp.Supplier.FirstName + " " + sp.Supplier.LastName).Trim(),
                    sp.Price_Per_Unit,
                    sp.Updated_At,
                    is_loss = sp.Price_Per_Unit >= mainUnitSellingPrice
                })
                .ToListAsync();

            return Ok(new
            {
                presetInfo.Main_Unit_ID,
                presetInfo.main_Unit,
                presetInfo.preset_Levels,
                main_Unit_Selling_Price = mainUnitSellingPrice,
                suppliers
            });
        }
    }
}
