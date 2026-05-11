using backend.Data;
using backend.Models.Inventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.Inventory
{
    [ApiController]
    [Route("api/product-audit-logs")]
    public class GetProductAuditLogs : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetProductAuditLogs(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet("{productId}")]
        [Authorize]
        public async Task<IActionResult> GetAuditLogs(
            [FromRoute] int productId,
            [FromQuery] int? presetId = null)
        {
            var query = _db.ProductAuditLogs
                .Where(a => a.Product_ID == productId);

            if (presetId.HasValue)
                query = query.Where(a => a.Product_Preset_ID == presetId.Value);

            var logs = await query
                .OrderByDescending(a => a.CreatedAt)
                .Take(50)
                .Select(a => new
                {
                    a.AuditLog_ID,
                    a.Product_ID,
                    a.Product_Preset_ID,
                    a.UserId,
                    a.UserName,
                    a.Action,
                    a.FieldName,
                    a.OldValue,
                    a.NewValue,
                    a.Description,
                    a.CreatedAt
                })
                .ToListAsync();

            return Ok(logs);
        }
    }
}
