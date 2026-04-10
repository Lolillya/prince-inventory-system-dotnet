using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.Suppliers
{
    [ApiController]
    [Route("api/suppliers")]
    public class GetSupplierPurchasePrices : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetSupplierPurchasePrices(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet("{supplierId}/purchase-prices")]
        public async Task<IActionResult> GetPrices(string supplierId)
        {
            var supplierExists = await _db.Users.AnyAsync(u => u.Id == supplierId);
            if (!supplierExists)
                return NotFound($"Supplier '{supplierId}' was not found.");

            var prices = await _db.SupplierProductPresetPrices
                .Where(sp => sp.Supplier_ID == supplierId)
                .Select(sp => new
                {
                    sp.Price_ID,
                    sp.Supplier_ID,
                    sp.Product_ID,
                    sp.Preset_ID,
                    sp.Price_Per_Unit,
                    sp.Created_At,
                    sp.Updated_At,
                    product = new
                    {
                        sp.Product.Product_ID,
                        sp.Product.Product_Name,
                        sp.Product.Product_Code
                    },
                    preset = new
                    {
                        sp.Preset.Preset_ID,
                        sp.Preset.Preset_Name,
                        sp.Preset.Main_Unit_ID,
                        main_Unit = sp.Preset.MainUnit != null ? new
                        {
                            sp.Preset.MainUnit.uom_ID,
                            sp.Preset.MainUnit.uom_Name
                        } : null
                    }
                })
                .ToListAsync();

            return Ok(prices);
        }
    }
}
