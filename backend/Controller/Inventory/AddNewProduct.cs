using System.Text.Json;
using backend.Data;
using backend.Dtos.Inventory;
using backend.Models.Inventory;
using backend.Models.Unit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.Inventory
{
    [ApiController]
    [Route("api/add-product")]
    public class AddNewProduct : ControllerBase
    {
        private readonly ApplicationDBContext _db;
        public AddNewProduct(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> AddProduct([FromBody] NewInventoryProductDto payload)
        {
            if (payload == null) return BadRequest("Payload Required!");

            Console.WriteLine("Received Payload: {0}" + JsonSerializer.Serialize(payload));

            await using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                var productResult = await AddToProduct(payload);
                var productId = productResult.Item2;

                var inventoryResult = await AddToInventory(payload, productId);

                // Add preset assignments if provided
                if (payload.UnitPresets != null && payload.UnitPresets.Any())
                {
                    await AssignPresetsToProduct(productId, payload.UnitPresets);
                }

                await transaction.CommitAsync();

                return Ok(new { message = "Product added successfully", product_ID = productId });
            }
            catch (Exception e)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }

        private async Task<(backend.Models.Inventory.Product, int)> AddToProduct(NewInventoryProductDto payload)
        {
            var item = await _db.Items.FindAsync(payload.Item_Id)
                ?? throw new Exception($"Item with ID {payload.Item_Id} not found");
            var brand = await _db.Brands.FindAsync(payload.Brand_Id)
                ?? throw new Exception($"Brand with ID {payload.Brand_Id} not found");
            var variant = await _db.Variants.FindAsync(payload.Variant_Id)
                ?? throw new Exception($"Variant with ID {payload.Variant_Id} not found");

            var itemCode = item.Item_Code ?? item.Item_ID.ToString("D3");
            var brandCode = brand.Brand_Code ?? brand.Brand_ID.ToString("D3");
            var variantCode = variant.Variant_Code ?? variant.Variant_ID.ToString("D4");

            var coreProductCode = itemCode + brandCode + variantCode;
            var productCode = $"{itemCode}-{brandCode}-{variantCode}";
            var productName = $"{item.ItemName} - {brand.BrandName} - {variant.Variant_Name}";

            var product = new backend.Models.Inventory.Product
            {
                Product_Name = productName,
                Description = payload.Description,
                Product_Code = productCode,
                Core_Product_Code = coreProductCode,
                Item_ID = payload.Item_Id,
                Brand_ID = payload.Brand_Id,
                Category_ID = payload.Category_Id,
                Variant_ID = payload.Variant_Id,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            _db.Products.Add(product);
            await _db.SaveChangesAsync();

            var productId = product.Product_ID;

            return (product, productId);
        }

        private async Task<backend.Models.Inventory.Inventory> AddToInventory(NewInventoryProductDto product, int productId)
        {
            var inventoryNumber = await GetLatestInventoryNumber();

            var inventoryItem = new backend.Models.Inventory.Inventory
            {
                Product_ID = productId,
                Total_Quantity = 0,
                Inventory_Number = inventoryNumber,
                Created_At = DateTime.Now,
                Updated_At = DateTime.Now,
                Inventory_Clerk = product.Inventory_Clerk
            };

            _db.Add(inventoryItem);
            await _db.SaveChangesAsync();

            return inventoryItem;
        }

        private async Task<int> GetLatestInventoryNumber()
        {
            var latestInventory = await _db.Inventory
                .OrderByDescending(i => i.Inventory_Number)
                .FirstOrDefaultAsync();

            return latestInventory != null ? latestInventory.Inventory_Number + 1 : 1001;
        }

        private async Task AssignPresetsToProduct(int productId, List<UnitPresetAssignment> unitPresets)
        {
            var product = await _db.Products.FindAsync(productId)
                ?? throw new Exception($"Product with ID {productId} not found");

            foreach (var preset in unitPresets)
            {
                // Verify preset exists
                var unitPreset = await _db.Unit_Presets.FindAsync(preset.Preset_ID)
                    ?? throw new Exception($"Preset with ID {preset.Preset_ID} not found");

                var sku = (product.Core_Product_Code ?? "") + "-" + (unitPreset.Preset_Code ?? unitPreset.Preset_ID.ToString("D4"));

                // Create the assignment
                var assignment = new Product_Unit_Preset
                {
                    Product_ID = productId,
                    Preset_ID = preset.Preset_ID,
                    Low_Stock_Level = preset.Low_Stock_Level,
                    Very_Low_Stock_Level = preset.Very_Low_Stock_Level,
                    SKU = sku,
                    Assigned_At = DateTime.UtcNow
                };

                await _db.Product_Unit_Presets.AddAsync(assignment);
            }

            await _db.SaveChangesAsync();
        }
    }
}