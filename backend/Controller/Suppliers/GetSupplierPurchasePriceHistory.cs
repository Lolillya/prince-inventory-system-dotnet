using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.Suppliers
{
    [ApiController]
    [Route("api/suppliers")]
    public class GetSupplierPurchasePriceHistory : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetSupplierPurchasePriceHistory(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet("{supplierId}/purchase-prices/history")]
        [Authorize]
        public async Task<IActionResult> GetHistory(
            string supplierId,
            [FromQuery] int productId,
            [FromQuery] int presetId)
        {
            var logs = await _db.ProductAuditLogs
                .Where(a =>
                    a.Supplier_ID == supplierId &&
                    a.Product_ID == productId &&
                    (a.Action == "SUPPLIER_PRICE_UPDATED" || a.Action == "SUPPLIER_PRICE_SET"))
                .Where(a => _db.Product_Unit_Presets
                    .Any(pup => pup.Product_Preset_ID == a.Product_Preset_ID
                        && pup.Product_ID == productId
                        && pup.Preset_ID == presetId))
                .OrderByDescending(a => a.CreatedAt)
                .Take(20)
                .Select(a => new
                {
                    a.AuditLog_ID,
                    a.UserId,
                    a.UserName,
                    a.Action,
                    a.OldValue,
                    a.NewValue,
                    a.Description,
                    a.CreatedAt
                })
                .ToListAsync();

            return Ok(logs);
        }
    }
}
