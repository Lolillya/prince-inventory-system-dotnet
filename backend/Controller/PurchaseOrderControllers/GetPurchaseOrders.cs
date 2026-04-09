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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
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
