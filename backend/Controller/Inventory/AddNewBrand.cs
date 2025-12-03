using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos.Inventory;
using backend.Models.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Inventory
{
    [ApiController]
    [Route("api/add-brand")]
    public class AddNewBrand : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public AddNewBrand(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> AddBrand([FromBody] BrandDto brand)
        {
            if (string.IsNullOrWhiteSpace(brand.BrandName))
            {
                return BadRequest("Brand name is required.");
            }

            await using var transaction = await _db.Database.BeginTransactionAsync();

            var newBrand = new backend.Models.Inventory.Brand
            {
                BrandName = brand.BrandName,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            await _db.Brands.AddAsync(newBrand);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Brand added successfully" });
        }
    }
}