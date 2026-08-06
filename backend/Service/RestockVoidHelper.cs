using backend.Data;
using backend.Models.RestockModel;
using Microsoft.EntityFrameworkCore;

namespace backend.Service
{
    public class RestockVoidOutcome
    {
        public bool Success { get; set; }
        public bool AlreadyVoided { get; set; }
        public bool NotFound { get; set; }
        public string? Message { get; set; }
        public List<object>? InsufficientItems { get; set; }
        public Restock? Restock { get; set; }
    }

    // Core restock-void reversal logic (inventory/preset deduction + shortfall
    // precheck), extracted so both VoidRestock and VoidInvoice (when cascading
    // to a linked auto-replenish restock) can reuse it inside a single shared
    // transaction. Callers own the transaction — this never begins/commits one.
    public static class RestockVoidHelper
    {
        public static async Task<RestockVoidOutcome> VoidRestockCoreAsync(
            ApplicationDBContext db,
            int restockId,
            string reason,
            string voidedByUserId,
            DateTime now)
        {
            var restock = await db.Restocks
                .Include(r => r.RestockBatches)
                    .ThenInclude(rb => rb.RestockLineItems)
                .FirstOrDefaultAsync(r => r.Restock_ID == restockId);

            if (restock == null)
            {
                return new RestockVoidOutcome { NotFound = true };
            }

            if (string.Equals(restock.Status, "Voided", StringComparison.OrdinalIgnoreCase))
            {
                return new RestockVoidOutcome { AlreadyVoided = true, Restock = restock };
            }

            var lineItems = restock.RestockBatches
                .SelectMany(rb => rb.RestockLineItems)
                .ToList();

            var inventoryDeductions = lineItems
                .GroupBy(li => li.Product_ID)
                .Select(g => new { Product_ID = g.Key, Quantity = g.Sum(x => x.Base_Unit_Quantity) })
                .ToList();

            var productIds = inventoryDeductions.Select(x => x.Product_ID).Distinct().ToList();

            var inventoryByProduct = await db.Inventory
                .Where(i => productIds.Contains(i.Product_ID))
                .ToDictionaryAsync(i => i.Product_ID);

            var presetDeductions = lineItems
                .Where(li => li.Preset_ID.HasValue)
                .GroupBy(li => new { li.Product_ID, Preset_ID = li.Preset_ID!.Value })
                .Select(g => new { g.Key.Product_ID, g.Key.Preset_ID, Quantity = g.Sum(x => x.Base_Unit_Quantity) })
                .ToList();

            var presetProductIds = presetDeductions.Select(x => x.Product_ID).Distinct().ToList();
            var presetIds = presetDeductions.Select(x => x.Preset_ID).Distinct().ToList();

            var productPresets = await db.Product_Unit_Presets
                .Where(pp => presetProductIds.Contains(pp.Product_ID) && presetIds.Contains(pp.Preset_ID))
                .ToListAsync();

            var presetQuantityRecords = new Dictionary<int, backend.Models.Unit.Product_Unit_Preset_Quantity>();
            foreach (var productPreset in productPresets)
            {
                var quantityRecord = await db.Product_Unit_Preset_Quantities
                    .Where(q => q.Product_Preset_ID == productPreset.Product_Preset_ID)
                    .OrderBy(q => q.Level == 1 ? 0 : 1)
                    .ThenBy(q => q.Level)
                    .FirstOrDefaultAsync();

                if (quantityRecord != null)
                {
                    presetQuantityRecords[productPreset.Product_Preset_ID] = quantityRecord;
                }
            }

            var insufficientByProduct = new Dictionary<int, (int Available, int Required)>();

            void RecordShortfall(int productId, int available, int required)
            {
                if (available >= required) return;

                if (insufficientByProduct.TryGetValue(productId, out var existing))
                {
                    insufficientByProduct[productId] = (
                        Math.Min(existing.Available, available),
                        Math.Max(existing.Required, required));
                }
                else
                {
                    insufficientByProduct[productId] = (available, required);
                }
            }

            foreach (var deduction in inventoryDeductions)
            {
                if (!inventoryByProduct.TryGetValue(deduction.Product_ID, out var inventory))
                {
                    return new RestockVoidOutcome
                    {
                        Message = $"Inventory row for product '{deduction.Product_ID}' was not found.",
                    };
                }

                RecordShortfall(deduction.Product_ID, inventory.Total_Quantity, deduction.Quantity);
            }

            foreach (var deduction in presetDeductions)
            {
                var productPreset = productPresets.FirstOrDefault(pp =>
                    pp.Product_ID == deduction.Product_ID && pp.Preset_ID == deduction.Preset_ID);

                if (productPreset == null)
                {
                    return new RestockVoidOutcome
                    {
                        Message = $"Product preset mapping not found for product '{deduction.Product_ID}' and preset '{deduction.Preset_ID}'.",
                    };
                }

                if (!presetQuantityRecords.TryGetValue(productPreset.Product_Preset_ID, out var quantityRecord))
                {
                    return new RestockVoidOutcome
                    {
                        Message = $"Preset quantity record not found for product preset '{productPreset.Product_Preset_ID}'.",
                    };
                }

                var availablePresetQuantity = Math.Min(
                    productPreset.Main_Unit_Quantity,
                    Math.Min(quantityRecord.Original_Quantity, quantityRecord.Remaining_Quantity));

                RecordShortfall(deduction.Product_ID, availablePresetQuantity, deduction.Quantity);
            }

            if (insufficientByProduct.Count > 0)
            {
                var insufficientProducts = await db.Products
                    .Include(p => p.Item)
                    .Include(p => p.Brand)
                    .Include(p => p.Variant)
                    .Where(p => insufficientByProduct.Keys.Contains(p.Product_ID))
                    .ToListAsync();

                var insufficientItems = insufficientProducts
                    .Select(p => (object)new
                    {
                        productId = p.Product_ID,
                        productName = $"{p.Item.ItemName}-{p.Brand.BrandName}-{p.Variant.Variant_Name}",
                        availableQuantity = insufficientByProduct[p.Product_ID].Available,
                        requiredQuantity = insufficientByProduct[p.Product_ID].Required
                    })
                    .ToList();

                return new RestockVoidOutcome { InsufficientItems = insufficientItems };
            }

            foreach (var deduction in inventoryDeductions)
            {
                var inventory = inventoryByProduct[deduction.Product_ID];
                inventory.Total_Quantity -= deduction.Quantity;
                inventory.Updated_At = now;
            }

            foreach (var deduction in presetDeductions)
            {
                var productPreset = productPresets.First(pp =>
                    pp.Product_ID == deduction.Product_ID && pp.Preset_ID == deduction.Preset_ID);

                var quantityRecord = presetQuantityRecords[productPreset.Product_Preset_ID];

                productPreset.Main_Unit_Quantity -= deduction.Quantity;
                quantityRecord.Original_Quantity -= deduction.Quantity;
                quantityRecord.Remaining_Quantity -= deduction.Quantity;
                quantityRecord.Updated_At = now;
            }

            restock.Restock_Notes = reason;
            restock.Status = "VOIDED";
            restock.UpdatedAt = now;
            restock.Voided_By = voidedByUserId;
            restock.Voided_At = now;

            return new RestockVoidOutcome { Success = true, Restock = restock };
        }
    }
}
