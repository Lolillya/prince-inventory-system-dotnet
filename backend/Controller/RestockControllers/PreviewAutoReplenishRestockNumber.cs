using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.RestockControllers
{
    // Lets the frontend show a live preview of the restock number/reference
    // that would be generated for an auto-replenish restock IF the invoice
    // were submitted right now. Mirrors the exact generation logic used in
    // AddInvoice.AutoReplenishDeficits so the preview matches what actually
    // gets created on submit (subject to race conditions between other
    // concurrent submissions, which is acceptable for a preview).
    [ApiController]
    [Route("api/restock/preview-auto-replenish-number")]
    public class PreviewAutoReplenishRestockNumber : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public PreviewAutoReplenishRestockNumber(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> Preview()
        {
            var now = DateTime.UtcNow;

            var restockCount = await _db.Restocks.CountAsync();
            var restockNumber = $"RS-AUTO-{now:yyyy}-{(restockCount + 1):D6}";

            var existingReferences = await _db.Restocks
                .Where(r => r.Restock_Invoice_Reference != null)
                .Select(r => r.Restock_Invoice_Reference)
                .ToListAsync();

            var nextNumber = 1;

            if (existingReferences.Count > 0)
            {
                var numbers = existingReferences
                    .Where(reference => reference.StartsWith("DR/INV-"))
                    .Select(reference => reference.Substring("DR/INV-".Length))
                    .Where(suffix => int.TryParse(suffix, out _))
                    .Select(suffix => int.Parse(suffix))
                    .OrderByDescending(n => n)
                    .ToList();

                if (numbers.Count > 0)
                {
                    nextNumber = numbers.First() + 1;
                }
            }

            var autoReplenishReference = $"DR/INV-{nextNumber:D6}";

            return Ok(new
            {
                restock_Number = restockNumber,
                auto_Replenish_Reference = autoReplenishReference,
                supplier_Company_Name = "Prince Educational Supplies",
                supplier_Label = "INTERNAL"
            });
        }
    }
}
