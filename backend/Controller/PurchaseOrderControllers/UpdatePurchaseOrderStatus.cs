using backend.Data;
using backend.Dtos.PurchaseOrder;
using backend.Models.Inventory;
using backend.Models.Unit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.PurchaseOrderControllers
{
    [ApiController]
    [Route("api/purchase-orders")]
    public class UpdatePurchaseOrderStatus : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public UpdatePurchaseOrderStatus(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPut("{purchaseOrderId:int}/status")]
        public async Task<IActionResult> UpdateStatus(int purchaseOrderId, [FromBody] PurchaseOrderUpdateStatusDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var normalizedStatus = dto.Status?.Trim().ToUpperInvariant();
            if (normalizedStatus != "PENDING" && normalizedStatus != "COMPLETED" && normalizedStatus != "CANCELLED")
            {
                return BadRequest("Status must be PENDING, COMPLETED, or CANCELLED.");
            }

            var purchaseOrder = await _db.PurchaseOrders
                .Include(po => po.LineItems)
                .FirstOrDefaultAsync(po => po.Purchase_Order_ID == purchaseOrderId);

            if (purchaseOrder == null)
            {
                return NotFound($"Purchase order '{purchaseOrderId}' not found.");
            }

            if (purchaseOrder.Status == "COMPLETED")
            {
                return BadRequest("Purchase order is already COMPLETED.");
            }

            await using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                if (normalizedStatus == "COMPLETED" && purchaseOrder.Status != "COMPLETED")
                {
                    await ApplyInventoryAndPresetUpdates(purchaseOrder.LineItems);
                }

                purchaseOrder.Status = normalizedStatus!;
                purchaseOrder.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Purchase order status updated successfully.",
                    purchase_Order_ID = purchaseOrder.Purchase_Order_ID,
                    status = purchaseOrder.Status,
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Failed to update purchase order status: {ex.Message}");
            }
        }

        private async Task ApplyInventoryAndPresetUpdates(ICollection<backend.Models.PurchaseOrderModel.PurchaseOrderLineItem> lineItems)
        {
            var now = DateTime.UtcNow;

            foreach (var lineItem in lineItems)
            {
                var inventory = await _db.Inventory
                    .FirstOrDefaultAsync(i => i.Product_ID == lineItem.Product_ID);

                if (inventory != null)
                {
                    inventory.Total_Quantity += lineItem.Quantity;
                    inventory.Updated_At = now;
                }
                else
                {
                    var inventoryCount = await _db.Inventory.CountAsync();
                    _db.Inventory.Add(new backend.Models.Inventory.Inventory
                    {
                        Product_ID = lineItem.Product_ID,
                        Total_Quantity = lineItem.Quantity,
                        Inventory_Number = inventoryCount + 1,
                        Created_At = now,
                        Updated_At = now,
                    });
                }

                if (!lineItem.Preset_ID.HasValue)
                {
                    continue;
                }

                var productPreset = await _db.Product_Unit_Presets
                    .Include(pp => pp.Preset)
                        .ThenInclude(p => p.PresetLevels)
                    .FirstOrDefaultAsync(pp =>
                        pp.Product_ID == lineItem.Product_ID &&
                        pp.Preset_ID == lineItem.Preset_ID.Value);

                if (productPreset == null)
                {
                    throw new InvalidOperationException(
                        $"Product preset not found for product '{lineItem.Product_ID}' and preset '{lineItem.Preset_ID.Value}'.");
                }

                productPreset.Main_Unit_Quantity += lineItem.Quantity;

                var presetLevels = productPreset.Preset.PresetLevels
                    .OrderBy(pl => pl.Level)
                    .ToList();

                var targetLevel = presetLevels.FirstOrDefault(pl => pl.Level == 1)
                    ?? presetLevels.FirstOrDefault();

                if (targetLevel == null)
                {
                    throw new InvalidOperationException(
                        $"Preset '{productPreset.Preset_ID}' does not define any unit levels.");
                }

                var quantityRecord = await _db.Product_Unit_Preset_Quantities
                    .FirstOrDefaultAsync(q =>
                        q.Product_Preset_ID == productPreset.Product_Preset_ID &&
                        q.Level == targetLevel.Level);

                if (quantityRecord != null)
                {
                    quantityRecord.Original_Quantity += lineItem.Quantity;
                    quantityRecord.Remaining_Quantity += lineItem.Quantity;
                    quantityRecord.Updated_At = now;
                }
                else
                {
                    _db.Product_Unit_Preset_Quantities.Add(new Product_Unit_Preset_Quantity
                    {
                        Product_Preset_ID = productPreset.Product_Preset_ID,
                        Level = targetLevel.Level,
                        UOM_ID = targetLevel.UOM_ID,
                        Original_Quantity = lineItem.Quantity,
                        Remaining_Quantity = lineItem.Quantity,
                        Created_At = now,
                        Updated_At = now,
                    });
                }
            }

            await _db.SaveChangesAsync();
        }
    }
}
