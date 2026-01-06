using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.UnitPreset
{
    [ApiController]
    [Route("api/unit-presets/{id}")]
    public class DeleteUnitPreset : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public DeleteUnitPreset(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int id)
        {
            await using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                var preset = await _db.Unit_Presets
                    .Include(p => p.PresetLevels)
                    .Include(p => p.ProductPresets)
                    .FirstOrDefaultAsync(p => p.Preset_ID == id);

                if (preset == null)
                {
                    return NotFound($"Preset with ID {id} not found");
                }

                // Remove all related data
                _db.Unit_Preset_Levels.RemoveRange(preset.PresetLevels);
                _db.Product_Unit_Presets.RemoveRange(preset.ProductPresets);
                _db.Unit_Presets.Remove(preset);

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Unit preset deleted successfully" });
            }
            catch (Exception e)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}
