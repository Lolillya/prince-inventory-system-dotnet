using backend.Data;
using backend.Dtos.Inventory;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        public async Task<IActionResult> UpdateInventoryProduct([FromBody] UpdateInventoryProductDto payload)
        {
            if (payload == null) return BadRequest("Payload Required!");

            Console.WriteLine("Received Payload: {0}" + System.Text.Json.JsonSerializer.Serialize(payload));

            await using var transaction = await _db.Database.BeginTransactionAsync();

            var updateResult = await UpdateProductDetails(payload);

            if (!updateResult)
            {
                await transaction.RollbackAsync();
                return NotFound("Product not found.");
            }
            await transaction.CommitAsync();

            return Ok();
        }

        private async Task<bool> UpdateProductDetails(UpdateInventoryProductDto payload)
        {
            var product = await _db.Products.FirstOrDefaultAsync(p => p.Product_Code == payload.ProductCode);
            if (product == null)
            {
                return false;
            }

            product.Product_Name = payload.ProductName;
            product.Description = payload.Description;
            product.Brand_ID = payload.Brand_Id;
            product.Category_ID = payload.Category_Id;
            product.Variant_ID = payload.Variant_Id;
            product.UpdatedAt = DateTime.Now;

            _db.Products.Update(product);
            await _db.SaveChangesAsync();

            return true;
        }
    };

}

