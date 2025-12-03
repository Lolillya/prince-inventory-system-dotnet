using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Inventory
{
    [ApiController]
    [Route("api/add-category")]
    public class AddNewCategory : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public AddNewCategory(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> AddCategory([FromBody] string categoryName)
        {
            if (string.IsNullOrWhiteSpace(categoryName))
            {
                return BadRequest("Category name is required.");
            }

            await using var transaction = await _db.Database.BeginTransactionAsync();

            var newCategory = new Category
            {
                Category_Name = categoryName,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            await _db.Categories.AddAsync(newCategory);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Category added successfully" });
        }
    }
}