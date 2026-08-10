using System;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos.User;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.Users.ToggleUserActive
{
    [ApiController]
    [Authorize]
    [Route("api/toggle-user-active")]
    public class ToggleUserActive : ControllerBase
    {
        private readonly ApplicationDBContext _db;
        private readonly UserManager<PersonalDetails> _userManager;

        public ToggleUserActive(ApplicationDBContext db, UserManager<PersonalDetails> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        [HttpPut]
        public async Task<IActionResult> Toggle([FromBody] ToggleUserActiveDto payload)
        {
            if (string.IsNullOrWhiteSpace(payload.Password))
            {
                return BadRequest("Password is required to proceed.");
            }

            var requestingUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(requestingUserId))
            {
                return Unauthorized("User is not authenticated.");
            }

            var requestingUser = await _userManager.FindByIdAsync(requestingUserId);
            if (requestingUser == null)
            {
                return Unauthorized("User account not found.");
            }

            var isPasswordValid = await _userManager.CheckPasswordAsync(requestingUser, payload.Password);
            if (!isPasswordValid)
            {
                return Unauthorized("Invalid password.");
            }

            try
            {
                var user = await _db.Users.FindAsync(payload.UserId);
                if (user == null)
                {
                    return NotFound($"User with id {payload.UserId} not found");
                }

                // Deactivating a customer (i.e. going from active -> inactive)
                // is only allowed once they have zero invoice records at all.
                if (user.IsActive)
                {
                    var hasAnyInvoices = await _db.Invoice.AnyAsync(i => i.Customer_ID == payload.UserId);
                    if (hasAnyInvoices)
                    {
                        return Conflict("This customer has invoice records and cannot be deactivated.");
                    }
                }

                user.IsActive = !user.IsActive;
                await _db.SaveChangesAsync();

                return Ok(new { userId = user.Id, isActive = user.IsActive });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
