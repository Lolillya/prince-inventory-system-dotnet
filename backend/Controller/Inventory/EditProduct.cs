using backend.Data;
using backend.Dtos.Inventory;
using backend.Models.Inventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace backend.Controller.Inventory
{
    [ApiController]
    [Route("api/update-inventory-product")]
    public class EditProduct : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public EditProduct(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> UpdateInventoryProduct([FromBody] UpdateInventoryProductDto payload)
        {
            if (payload == null) return BadRequest("Payload Required!");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue(JwtRegisteredClaimNames.GivenName) ?? "Unknown";

            Console.WriteLine("Received Payload: {0}" + System.Text.Json.JsonSerializer.Serialize(payload));

            await using var transaction = await _db.Database.BeginTransactionAsync();

            var updateResult = await UpdateProductDetails(payload, userId, userName);

            if (!updateResult)
            {
                await transaction.RollbackAsync();
                return NotFound("Product not found.");
            }

            // Update stock levels for unit presets
            await UpdateStockLevels(payload, userId, userName);

            await transaction.CommitAsync();

            return Ok();
        }

        private async Task<bool> UpdateProductDetails(UpdateInventoryProductDto payload, string userId, string userName)
        {
            var product = await _db.Products.FirstOrDefaultAsync(p => p.Product_Code == payload.ProductCode);
            if (product == null)
            {
                return false;
            }

            // Capture old values for audit diff
            var oldName = product.Product_Name;
            var oldDescription = product.Description;
            var oldBrandId = product.Brand_ID;
            var oldCategoryId = product.Category_ID;
            var oldVariantId = product.Variant_ID;

            product.Product_Name = payload.ProductName;
            product.Description = payload.Description;
            product.Brand_ID = payload.Brand_Id;
            product.Category_ID = payload.Category_Id;
            product.Variant_ID = payload.Variant_Id;
            product.UpdatedAt = DateTime.Now;

            _db.Products.Update(product);
            await _db.SaveChangesAsync();

            // Insert one audit record per changed field
            var auditLogs = new List<ProductAuditLog>();

            if (oldName != payload.ProductName)
                auditLogs.Add(BuildProductAuditLog(product.Product_ID, null, userId, userName, "PRODUCT_EDITED", "Product_Name", oldName, payload.ProductName, $"Renamed product: \"{oldName}\" → \"{payload.ProductName}\""));

            if (oldDescription != payload.Description)
                auditLogs.Add(BuildProductAuditLog(product.Product_ID, null, userId, userName, "PRODUCT_EDITED", "Description", oldDescription, payload.Description, "Updated product description"));

            if (oldBrandId != payload.Brand_Id)
                auditLogs.Add(BuildProductAuditLog(product.Product_ID, null, userId, userName, "PRODUCT_EDITED", "Brand", oldBrandId.ToString(), payload.Brand_Id.ToString(), $"Changed brand: {oldBrandId} → {payload.Brand_Id}"));

            if (oldCategoryId != payload.Category_Id)
                auditLogs.Add(BuildProductAuditLog(product.Product_ID, null, userId, userName, "PRODUCT_EDITED", "Category", oldCategoryId.ToString(), payload.Category_Id.ToString(), $"Changed category: {oldCategoryId} → {payload.Category_Id}"));

            if (oldVariantId != payload.Variant_Id)
                auditLogs.Add(BuildProductAuditLog(product.Product_ID, null, userId, userName, "PRODUCT_EDITED", "Variant", oldVariantId.ToString(), payload.Variant_Id.ToString(), $"Changed variant: {oldVariantId} → {payload.Variant_Id}"));

            if (auditLogs.Any())
                await _db.ProductAuditLogs.AddRangeAsync(auditLogs);

            return true;
        }

        private async Task UpdateStockLevels(UpdateInventoryProductDto payload, string userId, string userName)
        {
            foreach (var unitPreset in payload.UnitPresets)
            {
                var stockLevel = await _db.Product_Unit_Presets
                    .FirstOrDefaultAsync(sl => sl.Product_Preset_ID == unitPreset.Product_Preset_ID);

                if (stockLevel != null)
                {
                    var oldLow = stockLevel.Low_Stock_Level;
                    var oldVeryLow = stockLevel.Very_Low_Stock_Level;

                    stockLevel.Low_Stock_Level = unitPreset.Low_Stock_Level;
                    stockLevel.Very_Low_Stock_Level = unitPreset.Very_Low_Stock_Level;
                    _db.Product_Unit_Presets.Update(stockLevel);

                    var auditLogs = new List<ProductAuditLog>();

                    if (oldLow != unitPreset.Low_Stock_Level)
                        auditLogs.Add(BuildProductAuditLog(stockLevel.Product_ID, stockLevel.Product_Preset_ID, userId, userName, "STOCK_THRESHOLD_UPDATED", "Low_Stock_Level", oldLow?.ToString(), unitPreset.Low_Stock_Level.ToString(), $"Changed low stock level: {oldLow} → {unitPreset.Low_Stock_Level}"));

                    if (oldVeryLow != unitPreset.Very_Low_Stock_Level)
                        auditLogs.Add(BuildProductAuditLog(stockLevel.Product_ID, stockLevel.Product_Preset_ID, userId, userName, "STOCK_THRESHOLD_UPDATED", "Very_Low_Stock_Level", oldVeryLow?.ToString(), unitPreset.Very_Low_Stock_Level.ToString(), $"Changed very low stock level: {oldVeryLow} → {unitPreset.Very_Low_Stock_Level}"));

                    if (auditLogs.Any())
                        await _db.ProductAuditLogs.AddRangeAsync(auditLogs);
                }
                else
                {
                    var newStockLevel = new Models.Unit.Product_Unit_Preset
                    {
                        Product_Preset_ID = unitPreset.Product_Preset_ID,
                        Low_Stock_Level = unitPreset.Low_Stock_Level,
                        Very_Low_Stock_Level = unitPreset.Very_Low_Stock_Level
                    };
                    await _db.Product_Unit_Presets.AddAsync(newStockLevel);
                }
            }

            await _db.SaveChangesAsync();
        }

        private static ProductAuditLog BuildProductAuditLog(
            int productId, int? productPresetId, string userId, string userName,
            string action, string fieldName, string? oldValue, string? newValue, string description)
        {
            return new ProductAuditLog
            {
                Product_ID = productId,
                Product_Preset_ID = productPresetId,
                UserId = userId,
                UserName = userName,
                Action = action,
                FieldName = fieldName,
                OldValue = oldValue,
                NewValue = newValue,
                Description = description,
                CreatedAt = DateTime.UtcNow
            };
        }
    };

}

