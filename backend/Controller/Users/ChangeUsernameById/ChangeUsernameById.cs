using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using backend.Data;
using backend.Dtos.Account;
using backend.Models;
using backend.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Users.ChangeUsernameById
{
    [ApiController]
    [Authorize]
    [Route("api/change-username-by-id")]
    public class ChangeUsernameById : ControllerBase
    {
        private readonly ApplicationDBContext _db;
        private readonly UserManager<PersonalDetails> _userManager;

        public ChangeUsernameById(ApplicationDBContext db, UserManager<PersonalDetails> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        [HttpPut]
        public async Task<IActionResult> ChangeUsername([FromBody] ChangeUsernameDto payload)
        {
            var newUsername = payload.NewUsername?.Trim() ?? string.Empty;
            if (newUsername.Length < 3)
                return BadRequest("Username must be at least 3 characters.");

            var user = await _userManager.FindByIdAsync(payload.UserId);
            if (user == null)
                return NotFound($"User with id {payload.UserId} not found.");

            var oldUsername = user.UserName ?? string.Empty;
            if (string.Equals(oldUsername, newUsername, StringComparison.OrdinalIgnoreCase))
                return Ok("Username unchanged.");

            var existing = await _userManager.FindByNameAsync(newUsername);
            if (existing != null)
                return BadRequest("Username already exists.");

            var result = await _userManager.SetUserNameAsync(user, newUsername);
            if (!result.Succeeded)
                return BadRequest(result.Errors.Select(e => e.Description));

            var adminUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var adminUsername = User.FindFirstValue(JwtRegisteredClaimNames.GivenName) ?? "Unknown";

            _db.Set<UserAuditLog>().Add(new UserAuditLog
            {
                User_ID = payload.UserId,
                AdminUserId = adminUserId,
                AdminUsername = adminUsername,
                Action = "USERNAME_CHANGED",
                OldValue = oldUsername,
                NewValue = newUsername,
                Description = $"Username changed from '{oldUsername}' to '{newUsername}'",
                CreatedAt = DateTime.UtcNow,
            });
            await _db.SaveChangesAsync();

            return Ok("Username changed successfully.");
        }
    }
}
