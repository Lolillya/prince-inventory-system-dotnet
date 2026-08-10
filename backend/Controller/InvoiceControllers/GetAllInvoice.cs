using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
                    .Include(i => i.AutoReplenishRestock)
                    .Include(i => i.LineItems)
                        .ThenInclude(li => li.Product)
                            .ThenInclude(p => p.Brand)
                    .Include(i => i.LineItems)
                        .ThenInclude(li => li.Product)
                            .ThenInclude(p => p.Variant)
                    .Include(i => i.LineItems)
                        .ThenInclude(li => li.Product)
                            .ThenInclude(p => p.Category)
                    .Select(i => new
                    {
                        i.Invoice_ID,
                        i.Invoice_Number,
                        i.Notes,
                        i.Total_Amount,
                        i.Balance,
                        i.Discount,
                        i.Status,
                        i.Term,
                        i.CreatedAt,
                        i.UpdatedAt,
                        // Auto-replenish is tracked per-invoice, not per-line, so every
                        // line item on an auto-replenished invoice is flagged together.
                        AutoReplenishRestockNumber = i.AutoReplenishRestock != null
                            ? i.AutoReplenishRestock.Restock_Number
                            : null,
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
                                li.Product.Product_Name,
                                BrandName = li.Product.Brand.BrandName,
                                VariantName = li.Product.Variant.Variant_Name,
                                CategoryName = li.Product.Category.Category_Name
                            },
                            li.Unit,
                            li.Unit_Price,
                            li.Sub_Total,
                            li.Unit_Quantity,
                            // Best-effort "standard price" lookup: the line item doesn't
                            // store which preset/pricing entry was used at sale time, so
                            // we compare against the product's current preset pricing for
                            // the same unit of measure to flag likely manual overrides.
                            StandardPrice = _db.Product_Unit_Preset_Pricing
                                .Where(pp =>
                                    pp.UOM_ID == li.UOM_ID &&
                                    pp.ProductUnitPreset.Product_ID == li.Product_ID)
                                .Select(pp => (decimal?)pp.Price_Per_Unit)
                                .FirstOrDefault(),
                            StandardPriceDate = _db.Product_Unit_Preset_Pricing
                                .Where(pp =>
                                    pp.UOM_ID == li.UOM_ID &&
                                    pp.ProductUnitPreset.Product_ID == li.Product_ID)
                                .Select(pp => (DateTime?)pp.Created_At)
                                .FirstOrDefault()
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