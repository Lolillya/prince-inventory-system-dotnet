using backend.Data;
using backend.Models.Inventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace backend.Controller.Suppliers
{
    [ApiController]
    [Route("api/suppliers")]
    public class RemoveSupplierPurchasePrice : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public RemoveSupplierPurchasePrice(ApplicationDBContext db)
        {
            _db = db;
        }

        public class RemovePriceDto
        {
            public int Product_ID { get; set; }
            public int Preset_ID { get; set; }
        }

        [HttpDelete("{supplierId}/purchase-prices")]
        [Authorize]
        public async Task<IActionResult> Remove(string supplierId, [FromBody] RemovePriceDto payload)
        {
            var existing = await _db.SupplierProductPresetPrices
                .FirstOrDefaultAsync(sp =>
                    sp.Supplier_ID == supplierId &&
                    sp.Product_ID == payload.Product_ID &&
                    sp.Preset_ID == payload.Preset_ID);

            if (existing == null)
                return NotFound("No purchase price configured for this product/preset.");

            var oldPrice = existing.Price_Per_Unit;

            var productPresetId = await _db.Product_Unit_Presets
                .Where(pup => pup.Product_ID == payload.Product_ID && pup.Preset_ID == payload.Preset_ID)
                .Select(pup => (int?)pup.Product_Preset_ID)
                .FirstOrDefaultAsync();

            var mainUnitName = await _db.Unit_Presets
                .Where(p => p.Preset_ID == payload.Preset_ID)
                .Select(p => p.MainUnit != null ? p.MainUnit.uom_Name : null)
                .FirstOrDefaultAsync() ?? "Unit";
            var fieldName = $"{mainUnitName} (Main)";

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue(JwtRegisteredClaimNames.GivenName) ?? "Unknown";

            _db.SupplierProductPresetPrices.Remove(existing);

            await _db.ProductAuditLogs.AddAsync(new ProductAuditLog
            {
                Product_ID = payload.Product_ID,
                Product_Preset_ID = productPresetId,
                Supplier_ID = supplierId,
                UserId = userId,
                UserName = userName,
                Action = "SUPPLIER_PRICE_REMOVED",
                FieldName = fieldName,
                OldValue = oldPrice.ToString("F2"),
                NewValue = null,
                Description = $"Reverted {fieldName} purchase price to unconfigured (was {oldPrice:F2})",
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();

            return Ok(new { message = "Purchase price reverted to unconfigured" });
        }
    }
}
