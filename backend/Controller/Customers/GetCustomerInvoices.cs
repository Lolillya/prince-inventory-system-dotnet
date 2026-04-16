using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.Customers
{
    [ApiController]
    [Route("api/customers/{customerId}/invoices")]
    public class GetCustomerInvoices : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetCustomerInvoices(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetInvoicesByCustomer(string customerId)
        {
            try
            {
                var invoices = await _db.Invoice
                    .Where(i => i.Customer_ID == customerId)
                    .Include(i => i.Customer)
                    .Include(i => i.Clerk)
                    .Include(i => i.LineItems)
                        .ThenInclude(li => li.Product)
                    .Select(i => new
                    {
                        i.Invoice_ID,
                        i.Invoice_Number,
                        i.Notes,
                        i.Total_Amount,
                        i.Discount,
                        i.Balance,
                        i.Status,
                        i.Term,
                        i.CreatedAt,
                        Customer = new
                        {
                            Id = i.Customer.Id,
                            i.Customer.FirstName,
                            i.Customer.LastName,
                            i.Customer.CompanyName,
                            i.Customer.Email
                        },
                        Clerk = new
                        {
                            Id = i.Clerk.Id,
                            i.Clerk.FirstName,
                            i.Clerk.LastName,
                            i.Clerk.Email
                        },
                        LineItems = i.LineItems.Select(li => new
                        {
                            li.LineItem_ID,
                            li.Product_ID,
                            Product = new
                            {
                                li.Product.Product_ID,
                                li.Product.Product_Name
                            },
                            li.Unit,
                            li.Unit_Price,
                            li.Sub_Total,
                            li.Unit_Quantity
                        }).ToList()
                    })
                    .OrderByDescending(i => i.CreatedAt)
                    .ToListAsync();

                return Ok(invoices);
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}
