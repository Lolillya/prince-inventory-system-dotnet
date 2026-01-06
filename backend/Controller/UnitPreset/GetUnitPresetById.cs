using backend.Data;
using backend.Dtos.UnitPreset;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.UnitPreset
{
    [ApiController]
    [Route("api/unit-presets/{id}")]
    public class GetUnitPresetById : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetUnitPresetById(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var preset = await _db.Unit_Presets
                    .Include(p => p.MainUnit)
                    .Include(p => p.PresetLevels)
                        .ThenInclude(l => l.UnitOfMeasure)
                    .Include(p => p.ProductPresets)
                    .Where(p => p.Preset_ID == id)
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
                            .ToList()
                    })
                    .FirstOrDefaultAsync();

                if (preset == null)
                {
                    return NotFound($"Preset with ID {id} not found");
                }

                return Ok(preset);
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}
