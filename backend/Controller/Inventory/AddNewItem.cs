using backend.Data;
using backend.Dtos.Inventory;
using backend.Models.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Inventory
{
    [ApiController]
    [Route("api/add-item")]
    public class AddNewItem : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public AddNewItem(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> AddItem([FromBody] ItemDto item)
        {
            if (string.IsNullOrWhiteSpace(item.ItemName))
            {
                return BadRequest("Item name is required.");
            }

            await using var transaction = await _db.Database.BeginTransactionAsync();

            var newItem = new Item
            {
                ItemName = item.ItemName,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            await _db.Items.AddAsync(newItem);
            await _db.SaveChangesAsync();

            newItem.Item_Code = newItem.Item_ID.ToString("D3");
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Item added successfully", item_Code = newItem.Item_Code });
        }
    }
}
