using System;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.RestockControllers
{
    [ApiController]
    [Route("api/restock/by-purchase-order")]
    public class GetRestocksByPurchaseOrder : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetRestocksByPurchaseOrder(ApplicationDBContext db)
        {
            _db = db;
        }

        // Returns every restock tied to a purchase order (including voided/reversed
        // ones), newest first, for the PO's "View" restock history table.
        [HttpGet("{purchaseOrderId:int}")]
        public async Task<IActionResult> GetByPurchaseOrder(int purchaseOrderId)
        {
            try
            {
                var results = await _db.Restocks
                    .Include(r => r.Clerk)
                    .Include(r => r.VoidedByUser)
                    .Include(r => r.RestockBatches)
                        .ThenInclude(rb => rb.RestockLineItems)
                            .ThenInclude(rli => rli.Product)
                                .ThenInclude(p => p.Brand)
                    .Include(r => r.RestockBatches)
                        .ThenInclude(rb => rb.RestockLineItems)
                            .ThenInclude(rli => rli.Product)
                                .ThenInclude(p => p.Variant)
                    .Include(r => r.RestockBatches)
                        .ThenInclude(rb => rb.RestockLineItems)
                            .ThenInclude(rli => rli.BaseUnitOfMeasure)
                    .Where(r => r.Purchase_Order_ID == purchaseOrderId)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new
                    {
                        restock_ID = r.Restock_ID,
                        restock_Number = r.Restock_Number,
                        status = r.Status,
                        delivery_Resolution = r.Delivery_Resolution,
                        restock_Notes = r.Restock_Notes,
                        created_At = r.CreatedAt,
                        updated_At = r.UpdatedAt,
                        is_Reversed = r.Status == "VOIDED",
                        voided_At = r.Voided_At,
                        clerk = r.Clerk != null ? new
                        {
                            r.Clerk.Id,
                            r.Clerk.FirstName,
                            r.Clerk.LastName,
                        } : null,
                        voided_By_User = r.VoidedByUser != null ? new
                        {
                            r.VoidedByUser.Id,
                            r.VoidedByUser.FirstName,
                            r.VoidedByUser.LastName,
                        } : null,
                        total_Quantity = r.RestockBatches
                            .SelectMany(rb => rb.RestockLineItems)
                            .Sum(rli => rli.Base_Unit_Quantity),
                        line_Items = r.RestockBatches
                            .SelectMany(rb => rb.RestockLineItems.Select(rli => new
                            {
                                product = rli.Product != null ? new
                                {
                                    rli.Product.Product_ID,
                                    rli.Product.Product_Name,
                                    brand = rli.Product.Brand != null ? rli.Product.Brand.BrandName : "",
                                    variant = rli.Product.Variant != null ? rli.Product.Variant.Variant_Name : "",
                                } : null,
                                base_Unit = rli.BaseUnitOfMeasure != null ? new
                                {
                                    rli.BaseUnitOfMeasure.uom_ID,
                                    rli.BaseUnitOfMeasure.uom_Name,
                                } : null,
                                base_Unit_Quantity = rli.Base_Unit_Quantity,
                            }))
                            .ToList(),
                    })
                    .ToListAsync();

                return Ok(results);
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}
