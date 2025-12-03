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
    [Route("api/add-variant")]
    public class AddNewVariant : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public AddNewVariant(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> AddVariant([FromBody] VariantDto variant)
        {
            if (string.IsNullOrWhiteSpace(variant.VariantName))
            {
                return BadRequest("Variant name is required.");
            }

            await using var transaction = await _db.Database.BeginTransactionAsync();

            var newVariant = new backend.Models.Inventory.Variant
            {
                Variant_Name = variant.VariantName,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            await _db.Variants.AddAsync(newVariant);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Variant added successfully" });
        }
    }
}