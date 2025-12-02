using System.Text.Json;
using backend.Data;
using backend.Dtos.Inventory;
using backend.Models.Inventory;
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

            var productResult = await AddToProduct(payload);

            var inventoryResult = await AddToInventory(payload, productResult.Item2);



            await transaction.CommitAsync();

            return Ok(new { message = "Product added successfully" });
        }

        private async Task<(backend.Models.Inventory.Product, int)> AddToProduct(NewInventoryProductDto payload)
        {
            var product = new backend.Models.Inventory.Product
            {
                Product_Name = payload.ProductName,
                Description = payload.Description,
                Product_Code = payload.ProductCode,
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
    }
}