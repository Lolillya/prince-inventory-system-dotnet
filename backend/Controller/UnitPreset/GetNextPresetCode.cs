using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.UnitPreset
{
    [ApiController]
    [Route("api/unit-presets/next-code")]
    public class GetNextPresetCode : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetNextPresetCode(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetNextCode()
        {
            try
            {
                var maxId = await _db.Unit_Presets.MaxAsync(p => (int?)p.Preset_ID) ?? 0;
                var nextCode = (maxId + 1).ToString("D4");

                return Ok(new { next_Code = nextCode });
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}
