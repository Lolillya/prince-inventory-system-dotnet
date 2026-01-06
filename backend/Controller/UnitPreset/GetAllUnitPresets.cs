using backend.Data;
using backend.Dtos.UnitPreset;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.UnitPreset
{
    [ApiController]
    [Route("api/unit-presets")]
    public class GetAllUnitPresets : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetAllUnitPresets(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var presets = await _db.Unit_Presets
                    .Include(p => p.MainUnit)
                    .Include(p => p.PresetLevels)
                        .ThenInclude(l => l.UnitOfMeasure)
                    .Include(p => p.ProductPresets)
                        .ThenInclude(pp => pp.Product)
                            .ThenInclude(pr => pr.Brand)
                    .Include(p => p.ProductPresets)
                        .ThenInclude(pp => pp.Product)
                            .ThenInclude(pr => pr.Variant)
                    .Select(p => new UnitPresetResponseDto
                    {
                        Preset_ID = p.Preset_ID,
                        Preset_Name = p.Preset_Name,
                        Main_Unit_ID = p.Main_Unit_ID,
                        Main_Unit_Name = p.MainUnit.uom_Name,
                        Created_At = p.Created_At,
                        Updated_At = p.Updated_At,
                        Product_Count = p.ProductPresets.Count,
                        Levels = p.PresetLevels
                            .OrderBy(l => l.Level)
                            .Select(l => new UnitPresetLevelResponseDto
                            {
                                Level_ID = l.Level_ID,
                                UOM_ID = l.UOM_ID,
                                UOM_Name = l.UnitOfMeasure.uom_Name,
                                Level = l.Level,
                                Conversion_Factor = l.Conversion_Factor
                            })
                            .ToList(),
                        Products = p.ProductPresets
                            .Select(pp => new ProductPresetDto
                            {
                                Product_ID = pp.Product_ID,
                                Product_Name = pp.Product.Product_Name,
                                Brand_Name = pp.Product.Brand != null ? pp.Product.Brand.BrandName : null,
                                Variant_Name = pp.Product.Variant != null ? pp.Product.Variant.Variant_Name : null,
                                Assigned_At = pp.Assigned_At
                            })
                            .ToList()
                    })
                    .ToListAsync();

                return Ok(presets);
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}
