using backend.Data;
using backend.Models.Suppliers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.Suppliers
{
    [ApiController]
    [Route("api/suppliers")]
    public class UpsertSupplierPurchasePrices : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public UpsertSupplierPurchasePrices(ApplicationDBContext db)
        {
            _db = db;
        }

        public class UpsertPriceDto
        {
            public int Product_ID { get; set; }
            public int Preset_ID { get; set; }
            public decimal Price_Per_Unit { get; set; }
        }

        [HttpPost("{supplierId}/purchase-prices")]
        public async Task<IActionResult> Upsert(string supplierId, [FromBody] List<UpsertPriceDto> items)
        {
            if (items == null || items.Count == 0)
                return BadRequest("At least one price item is required.");

            var supplierExists = await _db.Users.AnyAsync(u => u.Id == supplierId);
            if (!supplierExists)
                return NotFound($"Supplier '{supplierId}' was not found.");

            foreach (var item in items)
            {
                if (item.Price_Per_Unit <= 0)
                    return BadRequest($"Price must be greater than 0 for product {item.Product_ID}, preset {item.Preset_ID}.");

                var productExists = await _db.Products.AnyAsync(p => p.Product_ID == item.Product_ID);
                if (!productExists)
                    return BadRequest($"Product {item.Product_ID} was not found.");

                var presetExists = await _db.Unit_Presets.AnyAsync(p => p.Preset_ID == item.Preset_ID);
                if (!presetExists)
                    return BadRequest($"Preset {item.Preset_ID} was not found.");

                var existing = await _db.SupplierProductPresetPrices
                    .FirstOrDefaultAsync(sp =>
                        sp.Supplier_ID == supplierId &&
                        sp.Product_ID == item.Product_ID &&
                        sp.Preset_ID == item.Preset_ID);

                if (existing != null)
                {
                    existing.Price_Per_Unit = item.Price_Per_Unit;
                    existing.Updated_At = DateTime.UtcNow;
                }
                else
                {
                    _db.SupplierProductPresetPrices.Add(new Supplier_Product_Preset_Price
                    {
                        Supplier_ID = supplierId,
                        Product_ID = item.Product_ID,
                        Preset_ID = item.Preset_ID,
                        Price_Per_Unit = item.Price_Per_Unit,
                        Created_At = DateTime.UtcNow,
                        Updated_At = DateTime.UtcNow
                    });
                }
            }

            await _db.SaveChangesAsync();

            // Return updated list for this supplier
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
