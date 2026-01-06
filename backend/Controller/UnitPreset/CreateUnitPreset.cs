using backend.Data;
using backend.Dtos.UnitPreset;
using backend.Models.Unit;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.UnitPreset
{
    [ApiController]
    [Route("api/unit-presets")]
    public class CreateUnitPreset : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public CreateUnitPreset(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUnitPresetDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Preset_Name))
            {
                return BadRequest("Preset name is required");
            }

            if (dto.Levels == null || !dto.Levels.Any())
            {
                return BadRequest("At least one level is required");
            }

            if (dto.Levels.Count > 5)
            {
                return BadRequest("Maximum 5 levels allowed");
            }

            await using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                var preset = new Unit_Preset
                {
                    Preset_Name = dto.Preset_Name,
                    Main_Unit_ID = dto.Main_Unit_ID,
                    Created_At = DateTime.UtcNow,
                    Updated_At = DateTime.UtcNow
                };

                await _db.Unit_Presets.AddAsync(preset);
                await _db.SaveChangesAsync();

                // Add levels
                foreach (var levelDto in dto.Levels)
                {
                    var level = new Unit_Preset_Level
                    {
                        Preset_ID = preset.Preset_ID,
                        UOM_ID = levelDto.UOM_ID,
                        Level = levelDto.Level,
                        Conversion_Factor = levelDto.Conversion_Factor,
                        Created_At = DateTime.UtcNow
                    };

                    await _db.Unit_Preset_Levels.AddAsync(level);
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Unit preset created successfully",
                    preset_ID = preset.Preset_ID
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
