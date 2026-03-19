

using backend.Data;
using backend.Dtos.RestockModel;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controller.RestockControllers
{
    [ApiController]
    [Authorize]
    [Route("api/restock/void")]
    public class VoidRestock : ControllerBase
    {
        private readonly ApplicationDBContext _db;
        private readonly UserManager<PersonalDetails> _userManager;

        public VoidRestock(ApplicationDBContext db, UserManager<PersonalDetails> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        [HttpPut("{restockId:int}")]
        public async Task<IActionResult> VoidById([FromRoute] int restockId, [FromBody] VoidRestockDto payload)
        {
            if (restockId <= 0)
            {
                return BadRequest("A valid restock id is required.");
            }

            if (payload == null)
            {
                return BadRequest("Payload is required.");
            }

            if (string.IsNullOrWhiteSpace(payload.Reason))
            {
                return BadRequest("Reason is required to void a restock.");
            }

            if (string.IsNullOrWhiteSpace(payload.Password))
            {
                return BadRequest("Password is required to void a restock.");
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized("User is not authenticated.");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Unauthorized("User account not found.");
            }

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, payload.Password);
            if (!isPasswordValid)
            {
                return Unauthorized("Invalid password.");
            }

            await using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                var restock = await _db.Restocks
                    .Include(r => r.RestockBatches)
                        .ThenInclude(rb => rb.RestockLineItems)
                    .FirstOrDefaultAsync(r => r.Restock_ID == restockId);

                if (restock == null)
                {
                    await transaction.RollbackAsync();
                    return NotFound($"Restock with id '{restockId}' not found.");
                }

                if (string.Equals(restock.Status, "Voided", StringComparison.OrdinalIgnoreCase))
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Restock '{restock.Restock_Number}' is already voided.");
                }

                var lineItems = restock.RestockBatches
                    .SelectMany(rb => rb.RestockLineItems)
                    .ToList();

                var now = DateTime.UtcNow;

                var inventoryDeductions = lineItems
                    .GroupBy(li => li.Product_ID)
                    .Select(g => new
                    {
                        Product_ID = g.Key,
                        Quantity = g.Sum(x => x.Base_Unit_Quantity)
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
                        await transaction.RollbackAsync();
                        return BadRequest($"Inventory row for product '{deduction.Product_ID}' was not found.");
                    }

                    if (inventory.Total_Quantity < deduction.Quantity)
                    {
                        await transaction.RollbackAsync();
                        return Conflict(
                            $"Cannot void restock. Product '{deduction.Product_ID}' has only {inventory.Total_Quantity} in inventory but needs {deduction.Quantity} to reverse this restock.");
                    }

                    inventory.Total_Quantity -= deduction.Quantity;
                    inventory.Updated_At = now;
                }

                var presetDeductions = lineItems
                    .Where(li => li.Preset_ID.HasValue)
                    .GroupBy(li => new { li.Product_ID, Preset_ID = li.Preset_ID!.Value })
                    .Select(g => new
                    {
                        g.Key.Product_ID,
                        g.Key.Preset_ID,
                        Quantity = g.Sum(x => x.Base_Unit_Quantity)
                    })
                    .ToList();

                if (presetDeductions.Any())
                {
                    var presetProductIds = presetDeductions.Select(x => x.Product_ID).Distinct().ToList();
                    var presetIds = presetDeductions.Select(x => x.Preset_ID).Distinct().ToList();

                    var productPresets = await _db.Product_Unit_Presets
                        .Where(pp => presetProductIds.Contains(pp.Product_ID) && presetIds.Contains(pp.Preset_ID))
                        .ToListAsync();

                    foreach (var deduction in presetDeductions)
                    {
                        var productPreset = productPresets.FirstOrDefault(pp =>
                            pp.Product_ID == deduction.Product_ID &&
                            pp.Preset_ID == deduction.Preset_ID);

                        if (productPreset == null)
                        {
                            await transaction.RollbackAsync();
                            return BadRequest(
                                $"Product preset mapping not found for product '{deduction.Product_ID}' and preset '{deduction.Preset_ID}'.");
                        }

                        if (productPreset.Main_Unit_Quantity < deduction.Quantity)
                        {
                            await transaction.RollbackAsync();
                            return Conflict(
                                $"Cannot void restock. Product preset '{productPreset.Product_Preset_ID}' has only {productPreset.Main_Unit_Quantity} main-unit quantity but needs {deduction.Quantity}.");
                        }

                        productPreset.Main_Unit_Quantity -= deduction.Quantity;

                        var quantityRecord = await _db.Product_Unit_Preset_Quantities
                            .Where(q => q.Product_Preset_ID == productPreset.Product_Preset_ID)
                            .OrderBy(q => q.Level == 1 ? 0 : 1)
                            .ThenBy(q => q.Level)
                            .FirstOrDefaultAsync();

                        if (quantityRecord == null)
                        {
                            await transaction.RollbackAsync();
                            return BadRequest(
                                $"Preset quantity record not found for product preset '{productPreset.Product_Preset_ID}'.");
                        }

                        if (quantityRecord.Original_Quantity < deduction.Quantity || quantityRecord.Remaining_Quantity < deduction.Quantity)
                        {
                            await transaction.RollbackAsync();
                            return Conflict(
                                $"Cannot void restock. Preset quantity record '{quantityRecord.Quantity_ID}' has insufficient quantity to reverse {deduction.Quantity}.");
                        }

                        quantityRecord.Original_Quantity -= deduction.Quantity;
                        quantityRecord.Remaining_Quantity -= deduction.Quantity;
                        quantityRecord.Updated_At = now;
                    }
                }

                restock.Restock_Notes = payload.Reason.Trim();
                restock.Status = "VOIDED";
                restock.UpdatedAt = now;

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Restock voided successfully.",
                    restockId = restock.Restock_ID,
                    restockNumber = restock.Restock_Number,
                    inventoryDeductions,
                    presetDeductions
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Error while voiding restock: {ex.Message}");
            }
        }
    }
}