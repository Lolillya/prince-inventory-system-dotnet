using backend.Dtos.Account;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Users.ChangePasswordById
{
    [ApiController]
    [Route("api/change-password-by-id")]
    public class ChangePasswordById : ControllerBase
    {
        private readonly UserManager<PersonalDetails> _userManager;

        public ChangePasswordById(UserManager<PersonalDetails> userManager)
        {
            _userManager = userManager;
        }

        [HttpPut]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto payload)
        {
            var user = await _userManager.FindByIdAsync(payload.UserId);
            if (user == null)
                return NotFound($"User with id {payload.UserId} not found.");

            var removeResult = await _userManager.RemovePasswordAsync(user);
            if (!removeResult.Succeeded)
                return BadRequest(removeResult.Errors.Select(e => e.Description));

            var addResult = await _userManager.AddPasswordAsync(user, payload.NewPassword);
            if (!addResult.Succeeded)
                return BadRequest(addResult.Errors.Select(e => e.Description));

            return Ok("Password changed successfully.");
        }
    }
}
