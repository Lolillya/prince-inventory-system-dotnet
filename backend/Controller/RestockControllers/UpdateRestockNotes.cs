using backend.Data;
using backend.Dtos.RestockModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.RestockControllers
{
    [ApiController]
    [Route("api/restock")]
    public class UpdateRestockNotes : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public UpdateRestockNotes(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPatch("{restockId:int}/notes")]
        public async Task<IActionResult> UpdateNotes([FromRoute] int restockId, [FromBody] UpdateRestockNotesDto payload)
        {
            if (restockId <= 0)
                return BadRequest("A valid restock id is required.");

            var restock = await _db.Restocks.FirstOrDefaultAsync(r => r.Restock_ID == restockId);

            if (restock == null)
                return NotFound($"Restock with id {restockId} not found.");

            restock.Restock_Notes = payload.Notes.Trim();
            restock.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new { restockId, restock_Notes = restock.Restock_Notes });
        }
    }
}
