using backend.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Controller.Customers
{
    [ApiController]
    [Route("api/customers/receivables-summary")]
    public class GetCustomerReceivablesSummary : ControllerBase
    {
        private readonly ApplicationDBContext _db;
        private readonly UserManager<PersonalDetails> _userManager;

        public GetCustomerReceivablesSummary(ApplicationDBContext db, UserManager<PersonalDetails> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        private static string ComputeInvoiceStatus(string? status, decimal balance, decimal totalAmount, DateTime createdAt, int term)
        {
            if (status?.ToUpper() == "VOIDED") return "VOIDED";
            if (balance <= 0) return "PAID";
            if (balance < totalAmount) return "PARTIALLY_PAID";
            if (DateTime.UtcNow > createdAt.AddDays(term)) return "OVERDUE";
            return "PENDING";
        }

        [HttpGet]
        public async Task<IActionResult> GetReceivablesSummary()
        {
            try
            {
                var customerUsers = await _userManager.GetUsersInRoleAsync("Customer");
                var customerIds = customerUsers.Select(u => u.Id).ToList();

                var invoices = await _db.Invoice
                    .Where(i => customerIds.Contains(i.Customer_ID))
                    .Select(i => new
                    {
                        i.Customer_ID,
                        i.Status,
                        i.Balance,
                        i.Total_Amount,
                        i.CreatedAt,
                        i.Term
                    })
                    .ToListAsync();

                var invoicesByCustomer = invoices
                    .GroupBy(i => i.Customer_ID)
                    .ToDictionary(g => g.Key, g =>
                    {
                        var statuses = g
                            .Select(i => ComputeInvoiceStatus(i.Status, i.Balance, i.Total_Amount, i.CreatedAt, i.Term))
                            .ToList();

                        var collectible = statuses.Where(s => s != "VOIDED").ToList();

                        var hasOverdue = statuses.Contains("OVERDUE");
                        var hasPartiallyPaid = statuses.Contains("PARTIALLY_PAID");
                        var hasPending = statuses.Contains("PENDING");
                        var allCollectibleInvoicesArePaid = collectible.Count > 0 && collectible.All(s => s == "PAID");
                        var allInvoicesAreVoided = statuses.Count > 0 && statuses.All(s => s == "VOIDED");

                        var totalOutstandingBalance = g
                            .Where((i, idx) => statuses[idx] != "PAID" && statuses[idx] != "VOIDED")
                            .Sum(i => i.Balance);

                        return new
                        {
                            HasOverdue = hasOverdue,
                            HasPartiallyPaid = hasPartiallyPaid,
                            HasPending = hasPending,
                            AllCollectibleInvoicesArePaid = allCollectibleInvoicesArePaid,
                            AllInvoicesAreVoided = allInvoicesAreVoided,
                            TotalOutstandingBalance = totalOutstandingBalance
                        };
                    });

                var result = customerUsers.Select(user =>
                {
                    invoicesByCustomer.TryGetValue(user.Id, out var inv);
                    return new
                    {
                        Id = user.Id,
                        user.FirstName,
                        user.LastName,
                        user.CompanyName,
                        TotalOutstandingBalance = inv?.TotalOutstandingBalance ?? 0m,
                        HasOverdue = inv?.HasOverdue ?? false,
                        HasPartiallyPaid = inv?.HasPartiallyPaid ?? false,
                        HasPending = inv?.HasPending ?? false,
                        AllCollectibleInvoicesArePaid = inv?.AllCollectibleInvoicesArePaid ?? false,
                        AllInvoicesAreVoided = inv?.AllInvoicesAreVoided ?? false
                    };
                }).ToList();

                return Ok(result);
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}
