using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.PurchaseOrderControllers
{
    [ApiController]
    [Route("api/purchase-orders")]
    public class GetPurchaseOrders : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetPurchaseOrders(ApplicationDBContext db)
        {
            _db = db;
        }

        private async Task<Dictionary<(int poId, int productId), int>> BuildReceivedLookupAsync(IEnumerable<int>? poIds = null)
        {
            var query = _db.RestockLineItems
                .Where(rli =>
                    rli.RestockBatch.Restock.Purchase_Order_ID != null &&
                    rli.RestockBatch.Restock.Status != "VOIDED");

            if (poIds != null)
            {
                var idList = poIds.ToList();
                query = query.Where(rli => idList.Contains(rli.RestockBatch.Restock.Purchase_Order_ID!.Value));
            }

            var received = await query
                .GroupBy(rli => new
                {
                    po_id = rli.RestockBatch.Restock.Purchase_Order_ID!.Value,
                    rli.Product_ID,
                })
                .Select(g => new { g.Key.po_id, g.Key.Product_ID, total = g.Sum(x => x.Base_Unit_Quantity) })
                .ToListAsync();

            return received.ToDictionary(r => (r.po_id, r.Product_ID), r => r.total);
        }

        private object ProjectLineItem(
            backend.Models.PurchaseOrderModel.PurchaseOrderLineItem li,
            int purchaseOrderId,
            Dictionary<(int, int), int> receivedDict)
        {
            var receivedQty = receivedDict.GetValueOrDefault((purchaseOrderId, li.Product_ID), 0);
            return new
            {
                purchase_Order_LineItem_ID = li.Purchase_Order_LineItem_ID,
                product_ID = li.Product_ID,
                preset_ID = li.Preset_ID,
                uom_ID = li.UOM_ID,
                quantity = li.Quantity,
                unit_Price = li.Unit_Price,
                sub_Total = li.Sub_Total,
                received_quantity = receivedQty,
                remaining_quantity = li.Quantity - receivedQty,
                product = li.Product != null ? new
                {
                    li.Product.Product_ID,
                    li.Product.Product_Name,
                    brand = li.Product.Brand != null ? li.Product.Brand.BrandName : "",
                    variant = li.Product.Variant != null ? li.Product.Variant.Variant_Name : "",
                } : null,
                unit = li.UnitOfMeasure != null ? new
                {
                    li.UnitOfMeasure.uom_ID,
                    li.UnitOfMeasure.uom_Name,
                } : null,
                unit_Preset = li.UnitPreset != null ? new
                {
                    li.UnitPreset.Preset_ID,
                    li.UnitPreset.Preset_Name,
                    preset_Levels = li.UnitPreset.PresetLevels
                        .OrderBy(pl => pl.Level)
                        .Select(pl => new { pl.Level, uom_Name = pl.UnitOfMeasure.uom_Name })
                        .ToList(),
                } : null,
            };
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var purchaseOrders = await _db.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.Clerk)
                .Include(po => po.LineItems)
                    .ThenInclude(li => li.Product)
                        .ThenInclude(p => p.Brand)
                .Include(po => po.LineItems)
                    .ThenInclude(li => li.Product)
                        .ThenInclude(p => p.Variant)
                .Include(po => po.LineItems)
                    .ThenInclude(li => li.UnitOfMeasure)
                .Include(po => po.LineItems)
                    .ThenInclude(li => li.UnitPreset)
                        .ThenInclude(p => p!.PresetLevels)
                            .ThenInclude(pl => pl.UnitOfMeasure)
                .OrderByDescending(po => po.CreatedAt)
                .ToListAsync();

            var poIds = purchaseOrders.Select(po => po.Purchase_Order_ID);
            var receivedDict = await BuildReceivedLookupAsync(poIds);

            var result = purchaseOrders.Select(po => new
            {
                purchase_Order_ID = po.Purchase_Order_ID,
                purchase_Order_Number = po.Purchase_Order_Number,
                status = po.Status,
                preferred_Delivery = po.Preferred_Delivery,
                notes = po.Notes,
                created_At = po.CreatedAt,
                updated_At = po.UpdatedAt,
                supplier = new
                {
                    supplier_Id = po.Supplier.Id,
                    first_Name = po.Supplier.FirstName,
                    last_Name = po.Supplier.LastName,
                    company_Name = po.Supplier.CompanyName,
                    email = po.Supplier.Email,
                },
                clerk = new
                {
                    id = po.Clerk.Id,
                    first_Name = po.Clerk.FirstName,
                    last_Name = po.Clerk.LastName,
                },
                line_Items = po.LineItems
                    .Select(li => ProjectLineItem(li, po.Purchase_Order_ID, receivedDict))
                    .ToList(),
                grand_Total = po.LineItems.Sum(li => li.Sub_Total),
            });

            return Ok(result);
        }

        [HttpGet("{purchaseOrderId:int}")]
        public async Task<IActionResult> GetById(int purchaseOrderId)
        {
            var purchaseOrder = await _db.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.Clerk)
                .Include(po => po.LineItems)
                    .ThenInclude(li => li.Product)
                        .ThenInclude(p => p.Brand)
                .Include(po => po.LineItems)
                    .ThenInclude(li => li.Product)
                        .ThenInclude(p => p.Variant)
                .Include(po => po.LineItems)
                    .ThenInclude(li => li.UnitOfMeasure)
                .Include(po => po.LineItems)
                    .ThenInclude(li => li.UnitPreset)
                        .ThenInclude(p => p!.PresetLevels)
                            .ThenInclude(pl => pl.UnitOfMeasure)
                .FirstOrDefaultAsync(po => po.Purchase_Order_ID == purchaseOrderId);

            if (purchaseOrder == null)
                return NotFound($"Purchase order '{purchaseOrderId}' not found.");

            var receivedDict = await BuildReceivedLookupAsync(new[] { purchaseOrderId });

            var result = new
            {
                purchase_Order_ID = purchaseOrder.Purchase_Order_ID,
                purchase_Order_Number = purchaseOrder.Purchase_Order_Number,
                status = purchaseOrder.Status,
                preferred_Delivery = purchaseOrder.Preferred_Delivery,
                notes = purchaseOrder.Notes,
                created_At = purchaseOrder.CreatedAt,
                updated_At = purchaseOrder.UpdatedAt,
                supplier = new
                {
                    supplier_Id = purchaseOrder.Supplier.Id,
                    first_Name = purchaseOrder.Supplier.FirstName,
                    last_Name = purchaseOrder.Supplier.LastName,
                    company_Name = purchaseOrder.Supplier.CompanyName,
                    email = purchaseOrder.Supplier.Email,
                },
                clerk = new
                {
                    id = purchaseOrder.Clerk.Id,
                    first_Name = purchaseOrder.Clerk.FirstName,
                    last_Name = purchaseOrder.Clerk.LastName,
                },
                line_Items = purchaseOrder.LineItems
                    .Select(li => ProjectLineItem(li, purchaseOrderId, receivedDict))
                    .ToList(),
                grand_Total = purchaseOrder.LineItems.Sum(li => li.Sub_Total),
            };

            return Ok(result);
        }

        [HttpGet("supplier/{supplierId}")]
        public async Task<IActionResult> GetBySupplier(string supplierId)
        {
            var supplierExists = await _db.Users.AnyAsync(u => u.Id == supplierId);
            if (!supplierExists)
            {
                return NotFound($"Supplier with id '{supplierId}' was not found.");
            }

            var data = await _db.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.Clerk)
                .Include(po => po.LineItems)
                    .ThenInclude(li => li.Product)
                        .ThenInclude(p => p.Brand)
                .Include(po => po.LineItems)
                    .ThenInclude(li => li.Product)
                        .ThenInclude(p => p.Variant)
                .Include(po => po.LineItems)
                    .ThenInclude(li => li.UnitOfMeasure)
                .Include(po => po.LineItems)
                    .ThenInclude(li => li.UnitPreset)
                        .ThenInclude(p => p!.PresetLevels)
                            .ThenInclude(pl => pl.UnitOfMeasure)
                .Where(po => po.Supplier_ID == supplierId)
                .OrderByDescending(po => po.CreatedAt)
                .Select(po => new
                {
                    purchase_Order_ID = po.Purchase_Order_ID,
                    purchase_Order_Number = po.Purchase_Order_Number,
                    status = po.Status,
                    preferred_Delivery = po.Preferred_Delivery,
                    notes = po.Notes,
                    created_At = po.CreatedAt,
                    updated_At = po.UpdatedAt,
                    supplier = new
                    {
                        supplier_Id = po.Supplier.Id,
                        first_Name = po.Supplier.FirstName,
                        last_Name = po.Supplier.LastName,
                        company_Name = po.Supplier.CompanyName,
                        email = po.Supplier.Email,
                    },
                    clerk = new
                    {
                        id = po.Clerk.Id,
                        first_Name = po.Clerk.FirstName,
                        last_Name = po.Clerk.LastName,
                    },
                    line_Items = po.LineItems.Select(li => new
                    {
                        purchase_Order_LineItem_ID = li.Purchase_Order_LineItem_ID,
                        product_ID = li.Product_ID,
                        preset_ID = li.Preset_ID,
                        uom_ID = li.UOM_ID,
                        quantity = li.Quantity,
                        unit_Price = li.Unit_Price,
                        sub_Total = li.Sub_Total,
                        product = li.Product != null ? new
                        {
                            li.Product.Product_ID,
                            li.Product.Product_Name,
                            brand = li.Product.Brand != null ? li.Product.Brand.BrandName : "",
                            variant = li.Product.Variant != null ? li.Product.Variant.Variant_Name : "",
                        } : null,
                        unit = li.UnitOfMeasure != null ? new
                        {
                            li.UnitOfMeasure.uom_ID,
                            li.UnitOfMeasure.uom_Name,
                        } : null,
                        unit_Preset = li.UnitPreset != null ? new
                        {
                            li.UnitPreset.Preset_ID,
                            li.UnitPreset.Preset_Name,
                            preset_Levels = li.UnitPreset.PresetLevels
                                .OrderBy(pl => pl.Level)
                                .Select(pl => new
                                {
                                    pl.Level,
                                    uom_Name = pl.UnitOfMeasure.uom_Name,
                                })
                                .ToList(),
                        } : null,
                    }).ToList(),
                    grand_Total = po.LineItems.Sum(li => li.Sub_Total),
                })
                .ToListAsync();

            return Ok(data);
        }
    }
}
