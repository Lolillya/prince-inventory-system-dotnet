using backend.Data;
using backend.Dtos.InvoiceDTO;
using backend.Models;
using backend.Models.InvoiceModel;
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
    public class InvoicePaymentController : ControllerBase
    {
        private readonly ApplicationDBContext _db;
        private readonly UserManager<PersonalDetails> _userManager;

        public InvoicePaymentController(ApplicationDBContext db, UserManager<PersonalDetails> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        // GET /api/invoice/{invoiceId}/payments
        [HttpGet("{invoiceId:int}/payments")]
        public async Task<IActionResult> GetPayments([FromRoute] int invoiceId)
        {
            var invoiceExists = await _db.Invoice.AnyAsync(i => i.Invoice_ID == invoiceId);
            if (!invoiceExists)
                return NotFound($"Invoice with id '{invoiceId}' not found.");

            var payments = await _db.InvoicePayments
                .Where(p => p.Invoice_ID == invoiceId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaymentResponseDto
                {
                    Payment_ID = p.Payment_ID,
                    Invoice_ID = p.Invoice_ID,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod,
                    ReferenceNo = p.ReferenceNo,
                    CreatedAt = p.CreatedAt,
                    CreatedBy = p.CreatedBy,
                    CreatedByName = p.Creator.UserName ?? p.CreatedBy,
                    IsInvalidated = p.IsInvalidated,
                    InvalidatedAt = p.InvalidatedAt,
                    InvalidatedBy = p.InvalidatedBy,
                    InvalidatedByName = p.Invalidator != null ? p.Invalidator.UserName : null,
                    InvalidationReason = p.InvalidationReason
                })
                .ToListAsync();

            return Ok(payments);
        }

        // POST /api/invoice/{invoiceId}/payments
        [HttpPost("{invoiceId:int}/payments")]
        public async Task<IActionResult> RecordPayment([FromRoute] int invoiceId, [FromBody] RecordPaymentDto payload)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("User is not authenticated.");

            var nonCashMethods = new[] { "Check", "BankTransfer", "Ewallet" };
            if (nonCashMethods.Contains(payload.PaymentMethod) && string.IsNullOrWhiteSpace(payload.ReferenceNo))
                return BadRequest("Reference number is required for this payment method.");

            await using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                var invoice = await _db.Invoice.FirstOrDefaultAsync(i => i.Invoice_ID == invoiceId);
                if (invoice == null)
                {
                    await transaction.RollbackAsync();
                    return NotFound($"Invoice with id '{invoiceId}' not found.");
                }

                if (payload.Amount > invoice.Balance)
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Payment amount (₱{payload.Amount:F2}) exceeds the remaining balance (₱{invoice.Balance:F2}).");
                }

                var payment = new InvoicePayment
                {
                    Invoice_ID = invoiceId,
                    Amount = payload.Amount,
                    PaymentMethod = payload.PaymentMethod,
                    ReferenceNo = string.IsNullOrWhiteSpace(payload.ReferenceNo) ? null : payload.ReferenceNo.Trim(),
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId,
                    IsInvalidated = false
                };

                _db.InvoicePayments.Add(payment);

                invoice.Balance -= payload.Amount;
                invoice.UpdatedAt = DateTime.UtcNow;

                if (invoice.Balance <= 0)
                {
                    invoice.Balance = 0;
                    invoice.Status = "PAID";
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                var creator = await _userManager.FindByIdAsync(userId);

                var response = new PaymentResponseDto
                {
                    Payment_ID = payment.Payment_ID,
                    Invoice_ID = payment.Invoice_ID,
                    Amount = payment.Amount,
                    PaymentMethod = payment.PaymentMethod,
                    ReferenceNo = payment.ReferenceNo,
                    CreatedAt = payment.CreatedAt,
                    CreatedBy = payment.CreatedBy,
                    CreatedByName = creator?.UserName ?? userId,
                    IsInvalidated = false,
                    InvalidatedAt = null,
                    InvalidatedBy = null,
                    InvalidatedByName = null,
                    InvalidationReason = null
                };

                return Ok(response);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // POST /api/invoice/payments/{paymentId}/invalidate
        [HttpPost("payments/{paymentId:int}/invalidate")]
        public async Task<IActionResult> InvalidatePayment([FromRoute] int paymentId, [FromBody] InvalidatePaymentDto payload)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(payload.Password))
                return BadRequest("Password is required.");

            if (string.IsNullOrWhiteSpace(payload.Reason))
                return BadRequest("Reason is required.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("User is not authenticated.");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized("User account not found.");

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, payload.Password);
            if (!isPasswordValid)
                return Unauthorized("Invalid password.");

            await using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                var payment = await _db.InvoicePayments
                    .Include(p => p.Invoice)
                    .FirstOrDefaultAsync(p => p.Payment_ID == paymentId);

                if (payment == null)
                {
                    await transaction.RollbackAsync();
                    return NotFound($"Payment with id '{paymentId}' not found.");
                }

                if (payment.IsInvalidated)
                {
                    await transaction.RollbackAsync();
                    return BadRequest("This payment has already been invalidated.");
                }

                payment.IsInvalidated = true;
                payment.InvalidatedAt = DateTime.UtcNow;
                payment.InvalidatedBy = userId;
                payment.InvalidationReason = payload.Reason.Trim();

                var invoice = payment.Invoice;
                invoice.Balance += payment.Amount;
                invoice.UpdatedAt = DateTime.UtcNow;

                if (invoice.Balance > 0 && string.Equals(invoice.Status, "PAID", StringComparison.OrdinalIgnoreCase))
                    invoice.Status = "PENDING";

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                var invalidator = await _userManager.FindByIdAsync(userId);

                var response = new PaymentResponseDto
                {
                    Payment_ID = payment.Payment_ID,
                    Invoice_ID = payment.Invoice_ID,
                    Amount = payment.Amount,
                    PaymentMethod = payment.PaymentMethod,
                    ReferenceNo = payment.ReferenceNo,
                    CreatedAt = payment.CreatedAt,
                    CreatedBy = payment.CreatedBy,
                    CreatedByName = (await _userManager.FindByIdAsync(payment.CreatedBy))?.UserName ?? payment.CreatedBy,
                    IsInvalidated = true,
                    InvalidatedAt = payment.InvalidatedAt,
                    InvalidatedBy = payment.InvalidatedBy,
                    InvalidatedByName = invalidator?.UserName ?? userId,
                    InvalidationReason = payment.InvalidationReason
                };

                return Ok(response);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
