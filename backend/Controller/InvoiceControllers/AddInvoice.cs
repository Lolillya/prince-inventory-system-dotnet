using System.Text.Json;
using backend.Data;
using backend.Data.Seeders;
using backend.Dtos.InvoiceDTO;
using backend.Models.InvoiceModel;
using backend.Models.LineItems;
using backend.Models.RestockModel;
using backend.Models.Unit;
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
            if (payload.LineItem == null || payload.LineItem.Count == 0)
                return BadRequest("At least one line item is required.");

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

            // Auto-replenish: create restock records for line items that request it before deducting.
            var replenishError = await AutoReplenishDeficits(payload, invoiceId);
            if (replenishError != null)
            {
                await transaction.RollbackAsync();
                return replenishError;
            }

            var inventoryError = await DeductInventoryQuantities(payload);
            if (inventoryError != null)
            {
                await transaction.RollbackAsync();
                return inventoryError;
            }

            await transaction.CommitAsync();

            return Ok(new { invoiceId, createdLineItems });

            // return Ok();
        }

        // CREATE INVOICE LOGIC
        private async Task<int> CreateInvoice(InvoiceDTO payload)
        {
            decimal totalLineItems = 0;
            foreach (var item in payload.LineItem)
                totalLineItems += item.Subtotal;

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
                Discount = 0,
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
                    Product_ID = dto.Product_ID,
                    Invoice_ID = invoiceId,
                    Unit = dto.Unit,
                    Unit_Price = dto.Unit_Price,
                    Unit_Quantity = dto.Unit_Quantity,
                    UOM_ID = dto.Uom_ID,
                    Discount = dto.Discount,
                    isPercentageDiscount = dto.isPercentageDiscount,
                    Sub_Total = dto.Subtotal

                };

                _db.Add(lineItem);
                await _db.SaveChangesAsync();

                createdLineItems.Add(new
                {
                    lineItem.LineItem_ID,
                    lineItem.Product_ID,
                    lineItem.Invoice_ID,
                    lineItem.Unit,
                    lineItem.Unit_Price,
                    lineItem.Unit_Quantity
                });
            }

            return createdLineItems;
        }

        // DEDUCT INVENTORY QUANTITY BY PRODUCT + PRESET QUANTITIES (CASCADE BORROW LOGIC)
        private async Task<IActionResult?> DeductInventoryQuantities(InvoiceDTO payload)
        {
            var now = DateTime.UtcNow;

            var (presetError, baseUnitDeductionsFromPreset) =
                await DeductPresetQuantities(payload.LineItem, now);

            if (presetError != null)
            {
                return presetError;
            }

            var inventoryDeductions = payload.LineItem
                .Where(li => !li.Preset_ID.HasValue)
                .GroupBy(li => li.Product_ID)
                .Select(g => new
                {
                    Product_ID = g.Key,
                    Quantity = g.Sum(x => x.Unit_Quantity)
                })
                .ToDictionary(x => x.Product_ID, x => x.Quantity);

            foreach (var kvp in baseUnitDeductionsFromPreset)
            {
                if (inventoryDeductions.ContainsKey(kvp.Key))
                {
                    inventoryDeductions[kvp.Key] += kvp.Value;
                }
                else
                {
                    inventoryDeductions[kvp.Key] = kvp.Value;
                }
            }

            var inventoryDeductionList = inventoryDeductions
                .Select(x => new { Product_ID = x.Key, Quantity = x.Value })
                .ToList();

            var productIds = inventoryDeductionList
                .Select(x => x.Product_ID)
                .Distinct()
                .ToList();

            var inventoryByProduct = await _db.Inventory
                .Where(i => productIds.Contains(i.Product_ID))
                .ToDictionaryAsync(i => i.Product_ID);

            foreach (var deduction in inventoryDeductionList)
            {
                if (!inventoryByProduct.TryGetValue(deduction.Product_ID, out var inventory))
                {
                    return BadRequest($"Inventory row for product '{deduction.Product_ID}' was not found.");
                }

                if (inventory.Total_Quantity < deduction.Quantity)
                {
                    return Conflict(
                        $"Insufficient inventory for product '{deduction.Product_ID}'. Available: {inventory.Total_Quantity}, requested: {deduction.Quantity}.");
                }

                inventory.Total_Quantity -= deduction.Quantity;
                inventory.Updated_At = now;
            }

            // Persist all tracked deduction updates (Inventory + PresetQuantities + Main_Unit_Quantity)
            await _db.SaveChangesAsync();

            return null;
        }

        private async Task<(IActionResult? Error, Dictionary<int, int> BaseUnitDeductionsByProduct)> DeductPresetQuantities(
            List<InvoiceLineItemPayloadDto> lineItems,
            DateTime now)
        {
            var baseUnitDeductionsByProduct = new Dictionary<int, int>();

            var deductionLines = lineItems
                .Where(li => li.Preset_ID.HasValue)
                .ToList();

            var productPresetsCache = new Dictionary<int, List<backend.Models.Unit.Product_Unit_Preset>>();

            foreach (var line in deductionLines)
            {
                if (!productPresetsCache.TryGetValue(line.Product_ID, out var productPresets))
                {
                    productPresets = await _db.Product_Unit_Presets
                        .Where(pp => pp.Product_ID == line.Product_ID)
                        .Include(pp => pp.Preset)
                            .ThenInclude(p => p.PresetLevels)
                        .Include(pp => pp.PresetQuantities)
                        .ToListAsync();

                    productPresetsCache[line.Product_ID] = productPresets;
                }

                if (productPresets.Count == 0)
                {
                    continue;
                }

                var candidatePresetIds = new List<int> { line.Preset_ID!.Value };

                if (line.Supplement_Preset_IDs != null && line.Supplement_Preset_IDs.Count > 0)
                {
                    candidatePresetIds.AddRange(line.Supplement_Preset_IDs);
                }

                var orderedPresetIds = candidatePresetIds
                    .Distinct()
                    .ToList();

                var remainingToDeduct = line.Unit_Quantity;
                var consumedBaseUnitsForLine = 0;

                foreach (var candidatePresetId in orderedPresetIds)
                {
                    if (remainingToDeduct <= 0)
                    {
                        break;
                    }

                    var selectedProductPreset = productPresets
                        .FirstOrDefault(pp => pp.Preset_ID == candidatePresetId);

                    if (selectedProductPreset == null)
                    {
                        return (
                            BadRequest($"Product preset '{candidatePresetId}' was not found for product '{line.Product_ID}'."),
                            baseUnitDeductionsByProduct
                        );
                    }

                    var presetLevels = selectedProductPreset.Preset.PresetLevels
                        .OrderBy(pl => pl.Level)
                        .ToList();

                    if (presetLevels.Count == 0)
                    {
                        return (
                            BadRequest($"Preset '{selectedProductPreset.Preset_ID}' for product '{line.Product_ID}' has no levels configured."),
                            baseUnitDeductionsByProduct
                        );
                    }

                    var selectedLevel = presetLevels
                        .FirstOrDefault(pl => pl.UOM_ID == line.Uom_ID);

                    if (selectedLevel == null)
                    {
                        // This preset is not compatible for the selected invoice unit.
                        continue;
                    }

                    var levelByNumber = presetLevels.ToDictionary(pl => pl.Level, pl => pl);
                    var quantityByLevel = selectedProductPreset.PresetQuantities
                        .ToDictionary(q => q.Level, q => q);

                    // Ensure every configured level has a quantity row to support borrow/carry operations.
                    foreach (var level in presetLevels)
                    {
                        if (quantityByLevel.ContainsKey(level.Level))
                        {
                            continue;
                        }

                        var newQuantityRow = new backend.Models.Unit.Product_Unit_Preset_Quantity
                        {
                            Product_Preset_ID = selectedProductPreset.Product_Preset_ID,
                            Level = level.Level,
                            UOM_ID = level.UOM_ID,
                            Original_Quantity = 0,
                            Remaining_Quantity = 0,
                            Created_At = now,
                            Updated_At = now,
                        };

                        _db.Product_Unit_Preset_Quantities.Add(newQuantityRow);
                        selectedProductPreset.PresetQuantities.Add(newQuantityRow);
                        quantityByLevel[level.Level] = newQuantityRow;
                    }

                    var requestedLevel = selectedLevel.Level;
                    var baseUnitsConsumed = 0;

                    int GetMaxDeductableAtRequestedLevel()
                    {
                        var total = 0;
                        var multiplier = 1;

                        for (var levelNumber = requestedLevel; levelNumber >= 1; levelNumber--)
                        {
                            if (!quantityByLevel.TryGetValue(levelNumber, out var levelRecord))
                            {
                                continue;
                            }

                            total += levelRecord.Remaining_Quantity * multiplier;

                            if (levelNumber > 1)
                            {
                                var currentLevelConfig = levelByNumber[levelNumber];
                                if (currentLevelConfig.Conversion_Factor <= 0)
                                {
                                    return 0;
                                }
                                multiplier *= currentLevelConfig.Conversion_Factor;
                            }
                        }

                        return Math.Max(0, total);
                    }

                    var maxDeductable = GetMaxDeductableAtRequestedLevel();
                    if (maxDeductable <= 0)
                    {
                        continue;
                    }

                    var quantityToDeductFromPreset = Math.Min(remainingToDeduct, maxDeductable);

                    IActionResult? EnsureAvailableAtLevel(int levelNumber, int needed)
                    {
                        var currentRecord = quantityByLevel[levelNumber];

                        if (currentRecord.Remaining_Quantity >= needed)
                        {
                            return null;
                        }

                        if (levelNumber == 1)
                        {
                            return Conflict(
                                $"Insufficient preset quantity for product '{line.Product_ID}', preset '{selectedProductPreset.Preset_ID}', level '1'. Available: {currentRecord.Remaining_Quantity}, requested: {needed}.");
                        }

                        var deficit = needed - currentRecord.Remaining_Quantity;
                        var currentLevelConfig = levelByNumber[levelNumber];

                        if (currentLevelConfig.Conversion_Factor <= 0)
                        {
                            return BadRequest(
                                $"Invalid conversion factor for preset '{selectedProductPreset.Preset_ID}' level '{levelNumber}'.");
                        }

                        var previousLevelNumber = levelNumber - 1;
                        var unitsToBorrowFromPrevious = (int)Math.Ceiling(
                            deficit / (decimal)currentLevelConfig.Conversion_Factor);

                        var upstreamError = EnsureAvailableAtLevel(previousLevelNumber, unitsToBorrowFromPrevious);
                        if (upstreamError != null)
                        {
                            return upstreamError;
                        }

                        var previousRecord = quantityByLevel[previousLevelNumber];
                        previousRecord.Remaining_Quantity -= unitsToBorrowFromPrevious;
                        previousRecord.Updated_At = now;

                        if (previousLevelNumber == 1)
                        {
                            baseUnitsConsumed += unitsToBorrowFromPrevious;
                        }

                        currentRecord.Remaining_Quantity +=
                            unitsToBorrowFromPrevious * currentLevelConfig.Conversion_Factor;
                        currentRecord.Updated_At = now;

                        return null;
                    }

                    var ensureError = EnsureAvailableAtLevel(requestedLevel, quantityToDeductFromPreset);
                    if (ensureError != null)
                    {
                        return (ensureError, baseUnitDeductionsByProduct);
                    }

                    var requestedLevelRecord = quantityByLevel[requestedLevel];
                    requestedLevelRecord.Remaining_Quantity -= quantityToDeductFromPreset;
                    requestedLevelRecord.Updated_At = now;

                    if (requestedLevel == 1)
                    {
                        baseUnitsConsumed += quantityToDeductFromPreset;
                    }

                    if (quantityByLevel.TryGetValue(1, out var levelOneRecord))
                    {
                        selectedProductPreset.Main_Unit_Quantity = Math.Max(0, levelOneRecord.Remaining_Quantity);
                    }

                    consumedBaseUnitsForLine += baseUnitsConsumed;
                    remainingToDeduct -= quantityToDeductFromPreset;
                }

                if (remainingToDeduct > 0)
                {
                    return (
                        Conflict(
                            $"Insufficient quantity across selected presets for product '{line.Product_ID}'. Remaining required: {remainingToDeduct} {line.Unit}."),
                        baseUnitDeductionsByProduct
                    );
                }

                if (consumedBaseUnitsForLine > 0)
                {
                    if (baseUnitDeductionsByProduct.ContainsKey(line.Product_ID))
                    {
                        baseUnitDeductionsByProduct[line.Product_ID] += consumedBaseUnitsForLine;
                    }
                    else
                    {
                        baseUnitDeductionsByProduct[line.Product_ID] = consumedBaseUnitsForLine;
                    }
                }
            }

            return (null, baseUnitDeductionsByProduct);
        }

        // AUTO-REPLENISH DEFICIT LOGIC
        // For each line item flagged for auto-replenish, calculate the deficit against current
        // preset quantities and create a restock record from the internal "Prince Educational
        // Supplies" supplier so that the subsequent deduction step can safely proceed.
        private async Task<IActionResult?> AutoReplenishDeficits(InvoiceDTO payload, int invoiceId)
        {
            var replenishLines = payload.LineItem
                .Where(li => li.Auto_Replenish && li.Preset_ID.HasValue)
                .ToList();

            if (replenishLines.Count == 0)
                return null;

            var now = DateTime.UtcNow;

            // Build restock number once for all auto-replenish restocks in this invoice.
            var restockCount = await _db.Restocks.CountAsync();
            var restockNumber = $"RS-AUTO-{now:yyyy}-{(restockCount + 1):D6}";

            var restock = new Restock
            {
                Restock_Number = restockNumber,
                Restock_Clerk = payload.Invoice_Clerk,
                Restock_Notes = $"Auto replenish — Invoice #{invoiceId}",
                Status = "COMPLETE",
                CreatedAt = now,
                UpdatedAt = now
            };

            _db.Restocks.Add(restock);
            await _db.SaveChangesAsync();

            var batch = new RestockBatch
            {
                Restock_ID = restock.Restock_ID,
                Supplier_ID = InternalUsers.PrinceSupplierUserId,
                Batch_Number = 1,
                CreatedAt = now,
                UpdatedAt = now
            };

            _db.RestockBatches.Add(batch);
            await _db.SaveChangesAsync();

            foreach (var line in replenishLines)
            {
                var productPreset = await _db.Product_Unit_Presets
                    .Include(pp => pp.Preset)
                        .ThenInclude(p => p.PresetLevels)
                    .Include(pp => pp.PresetQuantities)
                    .FirstOrDefaultAsync(pp =>
                        pp.Product_ID == line.Product_ID &&
                        pp.Preset_ID == line.Preset_ID!.Value);

                if (productPreset == null)
                    return BadRequest(
                        $"Preset '{line.Preset_ID}' not found for product '{line.Product_ID}'.");

                var presetLevels = productPreset.Preset.PresetLevels
                    .OrderBy(pl => pl.Level)
                    .ToList();

                var selectedLevel = presetLevels.FirstOrDefault(pl => pl.UOM_ID == line.Uom_ID);
                if (selectedLevel == null)
                    return BadRequest(
                        $"No preset level matches UOM '{line.Uom_ID}' for product '{line.Product_ID}'.");

                // Calculate current available quantity at the requested level (same logic as frontend).
                var quantityByLevel = productPreset.PresetQuantities
                    .ToDictionary(q => q.Level, q => q);

                int AvailableAtLevel(int targetLevel)
                {
                    var total = 0;
                    var multiplier = 1;
                    for (var lvl = targetLevel; lvl >= 1; lvl--)
                    {
                        if (!quantityByLevel.TryGetValue(lvl, out var record)) continue;
                        total += record.Remaining_Quantity * multiplier;
                        if (lvl > 1)
                        {
                            var cfg = presetLevels.First(pl => pl.Level == lvl);
                            if (cfg.Conversion_Factor <= 0) return 0;
                            multiplier *= cfg.Conversion_Factor;
                        }
                    }
                    return Math.Max(0, total);
                }

                var available = AvailableAtLevel(selectedLevel.Level);
                var deficit = line.Unit_Quantity - available;

                if (deficit <= 0)
                    continue; // No replenish needed for this line.

                // Convert deficit from the requested level back to base (level-1) units.
                var deficitInBaseUnits = deficit;
                for (var lvl = 2; lvl <= selectedLevel.Level; lvl++)
                {
                    var cfg = presetLevels.FirstOrDefault(pl => pl.Level == lvl);
                    if (cfg == null || cfg.Conversion_Factor <= 0) break;
                    deficitInBaseUnits = (int)Math.Ceiling(deficitInBaseUnits / (decimal)cfg.Conversion_Factor);
                }

                // Create the RestockLineItems record (base-unit entry).
                var mainLevel = presetLevels.First(pl => pl.Level == 1);

                var restockLineItem = new RestockLineItems
                {
                    Batch_ID = batch.Batch_ID,
                    Product_ID = line.Product_ID,
                    Base_UOM_ID = mainLevel.UOM_ID,
                    Base_Unit_Price = 0,
                    Base_Unit_Quantity = deficitInBaseUnits
                };

                _db.RestockLineItems.Add(restockLineItem);
                await _db.SaveChangesAsync();

                // Update / create preset quantities for each level.
                foreach (var level in presetLevels)
                {
                    if (!quantityByLevel.TryGetValue(level.Level, out var qRow))
                    {
                        qRow = new Product_Unit_Preset_Quantity
                        {
                            Product_Preset_ID = productPreset.Product_Preset_ID,
                            Level = level.Level,
                            UOM_ID = level.UOM_ID,
                            Original_Quantity = 0,
                            Remaining_Quantity = 0,
                            Created_At = now,
                            Updated_At = now,
                        };
                        _db.Product_Unit_Preset_Quantities.Add(qRow);
                        productPreset.PresetQuantities.Add(qRow);
                        quantityByLevel[level.Level] = qRow;
                    }
                }

                // Add the replenished base units to level-1 and propagate downward (no cascade needed;
                // the deduction step will borrow upward as usual).
                var level1Row = quantityByLevel[1];
                level1Row.Remaining_Quantity += deficitInBaseUnits;
                level1Row.Original_Quantity += deficitInBaseUnits;
                level1Row.Updated_At = now;

                productPreset.Main_Unit_Quantity = Math.Max(0, level1Row.Remaining_Quantity);

                // Update the inventory total to reflect the replenished stock.
                var inventory = await _db.Inventory.FirstOrDefaultAsync(i => i.Product_ID == line.Product_ID);
                if (inventory != null)
                {
                    inventory.Total_Quantity += deficitInBaseUnits;
                    inventory.Updated_At = now;
                }

                await _db.SaveChangesAsync();
            }

            // Append auto-replenish note to the invoice.
            var invoice = await _db.Invoice.FindAsync(invoiceId);
            if (invoice != null)
            {
                invoice.Notes = string.IsNullOrWhiteSpace(invoice.Notes)
                    ? "Auto replenish invoice"
                    : $"{invoice.Notes} | Auto replenish invoice";
                await _db.SaveChangesAsync();
            }

            return null;
        }

        private async Task<int> GetLatestInvoiceNumber()
        {
            var max = await _db.Invoice.MaxAsync(i => (int?)i.Invoice_Number);

            return (max ?? 0) + 1;
        }
    }
}