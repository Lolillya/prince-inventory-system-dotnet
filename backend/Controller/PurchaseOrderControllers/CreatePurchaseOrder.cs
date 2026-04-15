using backend.Data;
using backend.Dtos.PurchaseOrder;
using backend.Models.PurchaseOrderModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.PurchaseOrderControllers
{
    [ApiController]
    [Route("api/purchase-orders")]
    public class CreatePurchaseOrder : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public CreatePurchaseOrder(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PurchaseOrderCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (dto.LineItems == null || dto.LineItems.Count == 0)
            {
                return BadRequest("At least one line item is required.");
            }

            var supplierExists = await _db.Users.AnyAsync(u => u.Id == dto.Supplier_ID);
            if (!supplierExists)
            {
                return BadRequest($"Supplier with id '{dto.Supplier_ID}' was not found.");
            }

            var clerkExists = await _db.Users.AnyAsync(u => u.Id == dto.Purchase_Order_Clerk);
            if (!clerkExists)
            {
                return BadRequest($"Clerk with id '{dto.Purchase_Order_Clerk}' was not found.");
            }

            var productIds = dto.LineItems.Select(li => li.Product_ID).Distinct().ToList();
            var existingProductIds = await _db.Products
                .Where(p => productIds.Contains(p.Product_ID))
                .Select(p => p.Product_ID)
                .ToListAsync();

            var missingProductIds = productIds.Except(existingProductIds).ToList();
            if (missingProductIds.Count > 0)
            {
                return BadRequest($"Invalid product ids: {string.Join(", ", missingProductIds)}");
            }

            var uomIds = dto.LineItems.Select(li => li.UOM_ID).Distinct().ToList();
            var existingUomIds = await _db.UnitOfMeasure
                .Where(u => uomIds.Contains(u.uom_ID))
                .Select(u => u.uom_ID)
                .ToListAsync();

            var missingUomIds = uomIds.Except(existingUomIds).ToList();
            if (missingUomIds.Count > 0)
            {
                return BadRequest($"Invalid unit ids: {string.Join(", ", missingUomIds)}");
            }

            var presetIds = dto.LineItems
                .Where(li => li.Preset_ID.HasValue)
                .Select(li => li.Preset_ID!.Value)
                .Distinct()
                .ToList();

            if (presetIds.Count > 0)
            {
                var existingPresetIds = await _db.Unit_Presets
                    .Where(p => presetIds.Contains(p.Preset_ID))
                    .Select(p => p.Preset_ID)
                    .ToListAsync();

                var missingPresetIds = presetIds.Except(existingPresetIds).ToList();
                if (missingPresetIds.Count > 0)
                {
                    return BadRequest($"Invalid preset ids: {string.Join(", ", missingPresetIds)}");
                }
            }

            var purchaseOrderCount = await _db.PurchaseOrders.CountAsync();
            var poNumber = $"PO-{DateTime.UtcNow:yyyy}-{(purchaseOrderCount + 1):D6}";

            var purchaseOrder = new PurchaseOrder
            {
                Purchase_Order_Number = poNumber,
                Supplier_ID = dto.Supplier_ID,
                Purchase_Order_Clerk = dto.Purchase_Order_Clerk,
                Preferred_Delivery = dto.Preferred_Delivery,
                Notes = dto.Notes ?? string.Empty,
                Status = "NOT_DELIVERED",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                LineItems = dto.LineItems.Select(li => new PurchaseOrderLineItem
                {
                    Product_ID = li.Product_ID,
                    Preset_ID = li.Preset_ID,
                    UOM_ID = li.UOM_ID,
                    Quantity = li.Quantity,
                    Unit_Price = li.Unit_Price,
                    Sub_Total = li.Quantity * li.Unit_Price,
                }).ToList()
            };

            _db.PurchaseOrders.Add(purchaseOrder);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Purchase order created successfully.",
                purchase_Order_ID = purchaseOrder.Purchase_Order_ID,
                purchase_Order_Number = purchaseOrder.Purchase_Order_Number,
                status = purchaseOrder.Status,
            });
        }
    }
}
