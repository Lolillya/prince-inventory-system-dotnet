using backend.Data;
using backend.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.Users.GetUserAuditLogs
{
    [ApiController]
    [Authorize]
    [Route("api/user-audit-logs")]
    public class GetUserAuditLogs : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetUserAuditLogs(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetAuditLogs([FromRoute] string userId)
        {
            var logs = await _db.Set<UserAuditLog>()
                .Where(a => a.User_ID == userId)
                .OrderByDescending(a => a.CreatedAt)
                .Take(50)
                .Select(a => new
                {
                    a.AuditLog_ID,
                    a.User_ID,
                    a.AdminUserId,
                    a.AdminUsername,
                    a.Action,
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
