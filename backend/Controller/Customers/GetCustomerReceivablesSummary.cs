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

        [HttpGet]
        public async Task<IActionResult> GetReceivablesSummary()
        {
            try
            {
                var customerUsers = await _userManager.GetUsersInRoleAsync("Customer");
                var customerIds = customerUsers.Select(u => u.Id).ToList();

                var invoicesByCustomer = await _db.Invoice
                    .Where(i => customerIds.Contains(i.Customer_ID))
                    .GroupBy(i => i.Customer_ID)
                    .Select(g => new
                    {
                        CustomerId = g.Key,
                        TotalOutstandingBalance = g
                            .Where(i => i.Status != "PAID")
                            .Sum(i => i.Balance),
                        AllPaid = g.All(i => i.Status == "PAID"),
                        HasInvoices = g.Any()
                    })
                    .ToListAsync();

                var invoiceMap = invoicesByCustomer.ToDictionary(x => x.CustomerId);

                var result = customerUsers.Select(user =>
                {
                    invoiceMap.TryGetValue(user.Id, out var inv);
                    return new
                    {
                        Id = user.Id,
                        user.FirstName,
                        user.LastName,
                        user.CompanyName,
                        TotalOutstandingBalance = inv?.TotalOutstandingBalance ?? 0m,
                        OverallStatus = inv == null || !inv.HasInvoices || inv.AllPaid
                            ? "PAID"
                            : "PENDING"
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
