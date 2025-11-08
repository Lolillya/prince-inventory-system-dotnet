using System.Text.Json;
using backend.Data;
using backend.Dtos.InvoiceDTO;
using backend.Models.InvoiceModel;
using backend.Models.LineItems;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.InvoiceControllers
{
    [ApiController]
    [Route("api/invoice/")]
    public class AddInvoice : ControllerBase
    {
        private readonly ApplicationDBContext _db;
        public AddInvoice(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] InvoiceDTO payload)
        {
            if (payload == null) return BadRequest("Payload Required!");

            Console.WriteLine("Create payload: {0}", JsonSerializer.Serialize(payload));

            await using var transaction = await _db.Database.BeginTransactionAsync();

            if (!string.IsNullOrEmpty(payload.Invoice_Clerk))
            {
                var clerkExists = await _db.Users.AnyAsync(u => u.Id == payload.Invoice_Clerk);
                if (!clerkExists)
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Invoice clerk with id {payload.Invoice_Clerk} not found");
                }
            }

            var invoiceId = await CreateInvoice(payload);

            var createdLineItems = await CreateInvoiceLineItems(payload, invoiceId);

            await transaction.CommitAsync();

            return Ok(new { invoiceId, lineItems = createdLineItems });

            // return Ok();
        }

        // CREATE INVOICE LOGIC
        private async Task<int> CreateInvoice(InvoiceDTO payload)
        {
            decimal totalLineItems = 0;
            foreach (var item in payload.LineItem)
                totalLineItems += item.unit_price * item.unit_quantity;

            var invoiceNumber = await GetLatestInvoiceNumber();

            var invoice = new Invoice
            {
                Invoice_Number = invoiceNumber,
                Notes = payload.Notes,
                Customer_ID = payload.Customer_ID,
                Invoice_Clerk = payload.Invoice_Clerk,
                Total_Amount = totalLineItems,
                Status = "Invoice Status",
                Term = payload.Term,
                Discount = 0
            };

            _db.Add(invoice);

            await _db.SaveChangesAsync();

            return invoice.Invoice_ID;

        }

        // CREATE INVOICE LINE ITEMS LOGIC
        private async Task<List<object>> CreateInvoiceLineItems(InvoiceDTO payload, int invoiceId)
        {
            var createdLineItems = new List<object>();

            for (int i = 0; i < payload.LineItem.Count; i++)
            {
                var dto = payload.LineItem[i];

                var lineItem = new InvoiceLineItems
                {
                    Product_ID = dto.item.product.Product_ID,
                    Invoice_ID = invoiceId,
                    Unit = dto.unit,
                    Unit_Price = dto.unit_price,
                    Unit_Quantity = dto.unit_quantity
                };

                _db.Add(lineItem);
                await _db.SaveChangesAsync();

            }

            return createdLineItems;
        }

        private async Task<int> GetLatestInvoiceNumber()
        {
            var max = await _db.Invoice.MaxAsync(i => (int?)i.Invoice_Number);

            return (max ?? 0) + 1;
        }
    }
}