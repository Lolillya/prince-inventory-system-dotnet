using backend.Data;
using backend.Dtos.InvoiceDTO;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controller.InvoiceControllers
{
    [ApiController]
    [Authorize]
    [Route("api/invoice")]
    public class VoidInvoice : ControllerBase
    {
        private readonly ApplicationDBContext _db;
        private readonly UserManager<PersonalDetails> _userManager;

        public VoidInvoice(ApplicationDBContext db, UserManager<PersonalDetails> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        // PATCH /api/invoice/{invoiceId}/void
        [HttpPatch("{invoiceId:int}/void")]
        public async Task<IActionResult> Void([FromRoute] int invoiceId, [FromBody] VoidInvoiceDto payload)
        {
            if (payload == null || string.IsNullOrWhiteSpace(payload.Password))
                return BadRequest("Password is required to void an invoice.");

            if (string.IsNullOrWhiteSpace(payload.Reason))
                return BadRequest("Reason is required to void an invoice.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("User is not authenticated.");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized("User account not found.");

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, payload.Password);
            if (!isPasswordValid)
                return Unauthorized("Invalid password.");

            var invoice = await _db.Invoice.FirstOrDefaultAsync(i => i.Invoice_ID == invoiceId);
            if (invoice == null)
                return NotFound($"Invoice with id '{invoiceId}' not found.");

            if (invoice.Status == "VOIDED")
                return BadRequest("Invoice is already voided.");

            // An invoice can only be voided once it has ZERO active (i.e. not
            // yet invalidated) applied payments. Precheck this up front and
            // return a rich enough payload for the frontend to explain why.
            var activePayments = await _db.InvoicePayments
                .Where(p => p.Invoice_ID == invoiceId && !p.IsInvalidated)
                .ToListAsync();

            if (activePayments.Count > 0)
            {
                return Conflict(new
                {
                    message = "This invoice has applied payments.",
                    activePaymentCount = activePayments.Count,
                    activePaymentTotal = activePayments.Sum(p => p.Amount),
                });
            }

            invoice.Status = "VOIDED";
            invoice.Notes = payload.Reason.Trim();
            invoice.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new { invoice.Invoice_ID, invoice.Status });
        }
    }
}
