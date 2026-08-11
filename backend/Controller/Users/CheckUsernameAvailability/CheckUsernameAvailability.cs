using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Users.CheckUsernameAvailability
{
    [ApiController]
    [Authorize]
    [Route("api/check-username-availability")]
    public class CheckUsernameAvailability : ControllerBase
    {
        private readonly UserManager<PersonalDetails> _userManager;

        public CheckUsernameAvailability(UserManager<PersonalDetails> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> CheckAvailability(
            [FromQuery] string username,
            [FromQuery] string? excludeUserId = null)
        {
            if (string.IsNullOrWhiteSpace(username) || username.Trim().Length < 3)
                return Ok(new { available = false, reason = "Username must be at least 3 characters." });

            var existing = await _userManager.FindByNameAsync(username.Trim());
            var available = existing == null || existing.Id == excludeUserId;

            return Ok(new { available });
        }
    }
}
