using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.UnitPreset
{
    [ApiController]
    [Route("api/unit-presets/{presetId}/products/{productId}")]
    public class RemoveProductFromPreset : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public RemoveProductFromPreset(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpDelete]
        public async Task<IActionResult> Remove(int presetId, int productId)
        {
            try
            {
                var assignment = await _db.Product_Unit_Presets
                    .FirstOrDefaultAsync(p => p.Preset_ID == presetId && p.Product_ID == productId);

                if (assignment == null)
                {
                    return NotFound($"Product {productId} is not assigned to preset {presetId}");
                }

                _db.Product_Unit_Presets.Remove(assignment);
                await _db.SaveChangesAsync();

                return Ok(new { message = "Product removed from preset successfully" });
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}
