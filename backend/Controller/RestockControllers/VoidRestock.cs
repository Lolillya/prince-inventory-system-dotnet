using backend.Data;
using backend.Dtos.RestockModel;
using backend.Models;
using backend.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controller.RestockControllers
{
    [ApiController]
    [Authorize]
    [Route("api/restock/void")]
    public class VoidRestock : ControllerBase
    {
        private readonly ApplicationDBContext _db;
        private readonly UserManager<PersonalDetails> _userManager;

        public VoidRestock(ApplicationDBContext db, UserManager<PersonalDetails> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        [HttpPut("{restockId:int}")]
        public async Task<IActionResult> VoidById([FromRoute] int restockId, [FromBody] VoidRestockDto payload)
        {
            if (restockId <= 0)
            {
                return BadRequest("A valid restock id is required.");
            }

            if (payload == null)
            {
                return BadRequest("Payload is required.");
            }

            if (string.IsNullOrWhiteSpace(payload.Reason))
            {
                return BadRequest("Reason is required to void a restock.");
            }

            if (string.IsNullOrWhiteSpace(payload.Password))
            {
                return BadRequest("Password is required to void a restock.");
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized("User is not authenticated.");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Unauthorized("User account not found.");
            }

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, payload.Password);
            if (!isPasswordValid)
            {
                return Unauthorized("Invalid password.");
            }

            await using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                var reason = payload.Reason.Trim();
                var now = DateTime.UtcNow;

                var outcome = await RestockVoidHelper.VoidRestockCoreAsync(_db, restockId, reason, user.Id, now);

                if (outcome.NotFound)
                {
                    await transaction.RollbackAsync();
                    return NotFound($"Restock with id '{restockId}' not found.");
                }

                if (outcome.AlreadyVoided)
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Restock '{outcome.Restock?.Restock_Number}' is already voided.");
                }

                if (outcome.InsufficientItems != null)
                {
                    await transaction.RollbackAsync();
                    return Conflict(new
                    {
                        message = "There isn't enough inventory available to fully reverse this restock.",
                        insufficientItems = outcome.InsufficientItems
                    });
                }

                if (!outcome.Success || outcome.Restock == null)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(outcome.Message ?? "Unable to void restock.");
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Restock voided successfully.",
                    restockId = outcome.Restock.Restock_ID,
                    restockNumber = outcome.Restock.Restock_Number,
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Error while voiding restock: {ex.Message}");
            }
        }
    }
}
