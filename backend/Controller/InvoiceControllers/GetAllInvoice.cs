using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos.InvoiceDTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace backend.Controller.InvoiceControllers
{
    [ApiController]
    [Route("api/invoice/get-all")]
    public class GetAllInvoice : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetAllInvoice(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var invoices = await _db.Invoice
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
                            li.Quantity
                        }).ToList()
                    })
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