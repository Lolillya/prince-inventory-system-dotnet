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

        // DEDUCT INVENTORY QUANTITY BY PRODUCT (NO UNIT PRESET QUANTITY DEDUCTION YET)
        private async Task<IActionResult?> DeductInventoryQuantities(InvoiceDTO payload)
        {
            var now = DateTime.UtcNow;

            var inventoryDeductions = payload.LineItem
                .GroupBy(li => li.Product_ID)
                .Select(g => new
                {
                    Product_ID = g.Key,
                    Quantity = g.Sum(x => x.Unit_Quantity)
                })
                .ToList();

            var productIds = inventoryDeductions
                .Select(x => x.Product_ID)
                .Distinct()
                .ToList();

            var inventoryByProduct = await _db.Inventory
                .Where(i => productIds.Contains(i.Product_ID))
                .ToDictionaryAsync(i => i.Product_ID);

            foreach (var deduction in inventoryDeductions)
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

            var presetError = await DeductPresetQuantities(payload.LineItem, now);
            if (presetError != null)
            {
                return presetError;
            }

            // Persist all tracked deduction updates (Inventory + PresetQuantities + Main_Unit_Quantity)
            await _db.SaveChangesAsync();

            return null;
        }

        private async Task<IActionResult?> DeductPresetQuantities(
            List<InvoiceLineItemPayloadDto> lineItems,
            DateTime now)
        {
            var deductions = lineItems
                .GroupBy(li => new { li.Product_ID, li.Preset_ID, li.Uom_ID })
                .Select(g => new
                {
                    g.Key.Product_ID,
                    g.Key.Preset_ID,
                    Uom_ID = g.Key.Uom_ID,
                    Quantity = g.Sum(x => x.Unit_Quantity)
                })
                .ToList();

            foreach (var deduction in deductions)
            {
                var productPresets = await _db.Product_Unit_Presets
                    .Where(pp => pp.Product_ID == deduction.Product_ID)
                    .Include(pp => pp.Preset)
                        .ThenInclude(p => p.PresetLevels)
                    .Include(pp => pp.PresetQuantities)
                    .ToListAsync();

                if (productPresets.Count == 0)
                {
                    continue;
                }

                backend.Models.Unit.Product_Unit_Preset? selectedProductPreset;

                if (deduction.Preset_ID.HasValue)
                {
                    selectedProductPreset = productPresets
                        .FirstOrDefault(pp => pp.Preset_ID == deduction.Preset_ID.Value);

                    if (selectedProductPreset == null)
                    {
                        return BadRequest(
                            $"Product preset '{deduction.Preset_ID.Value}' was not found for product '{deduction.Product_ID}'.");
                    }
                }
                else
                {
                    var matchingPresets = productPresets
                        .Where(pp => pp.Preset.PresetLevels.Any(pl => pl.UOM_ID == deduction.Uom_ID))
                        .ToList();

                    if (matchingPresets.Count == 0)
                    {
                        continue;
                    }

                    if (matchingPresets.Count > 1)
                    {
                        return BadRequest(
                            $"Multiple presets match product '{deduction.Product_ID}' and unit '{deduction.Uom_ID}'. Include preset_ID in invoice line item.");
                    }

                    selectedProductPreset = matchingPresets[0];
                }

                var presetLevels = selectedProductPreset.Preset.PresetLevels
                    .OrderBy(pl => pl.Level)
                    .ToList();

                if (presetLevels.Count == 0)
                {
                    return BadRequest(
                        $"Preset '{selectedProductPreset.Preset_ID}' for product '{deduction.Product_ID}' has no levels configured.");
                }

                var selectedLevel = presetLevels
                    .FirstOrDefault(pl => pl.UOM_ID == deduction.Uom_ID);

                if (selectedLevel == null)
                {
                    return BadRequest(
                        $"Selected unit '{deduction.Uom_ID}' is not part of preset '{selectedProductPreset.Preset_ID}'.");
                }

                var deductionLevelNumber = selectedLevel.Level;
                var deductionQuantity = deduction.Quantity;

                if (selectedLevel.Level > 1)
                {
                    if (selectedLevel.Conversion_Factor <= 0)
                    {
                        return BadRequest(
                            $"Invalid conversion factor for preset '{selectedProductPreset.Preset_ID}' level '{selectedLevel.Level}'.");
                    }

                    deductionLevelNumber = selectedLevel.Level - 1;
                    deductionQuantity = (int)Math.Ceiling(
                        deduction.Quantity / (decimal)selectedLevel.Conversion_Factor);
                }

                var deductionLevel = presetLevels
                    .FirstOrDefault(pl => pl.Level == deductionLevelNumber);

                if (deductionLevel == null)
                {
                    return BadRequest(
                        $"Cannot resolve deduction level '{deductionLevelNumber}' for preset '{selectedProductPreset.Preset_ID}'.");
                }

                var quantityRecord = selectedProductPreset.PresetQuantities
                    .FirstOrDefault(q => q.Level == deductionLevelNumber);

                if (quantityRecord == null)
                {
                    return BadRequest(
                        $"Preset quantity record for level '{deductionLevelNumber}' was not found on preset '{selectedProductPreset.Preset_ID}'.");
                }

                if (quantityRecord.Remaining_Quantity < deductionQuantity)
                {
                    return Conflict(
                        $"Insufficient preset quantity for product '{deduction.Product_ID}', preset '{selectedProductPreset.Preset_ID}', level '{deductionLevelNumber}'. Available: {quantityRecord.Remaining_Quantity}, requested: {deductionQuantity}.");
                }

                quantityRecord.Remaining_Quantity -= deductionQuantity;
                quantityRecord.Updated_At = now;

                if (deductionLevelNumber == 1)
                {
                    selectedProductPreset.Main_Unit_Quantity = Math.Max(
                        0,
                        selectedProductPreset.Main_Unit_Quantity - deductionQuantity);
                }
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