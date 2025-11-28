using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.Inventory
{
    [ApiController]
    [Route("api/get-product-fields")]
    public class GetProductFields : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetProductFields(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetFields()
        {
            try
            {


                var brands = await _db.Brands
                    .Select(b => new { b.BrandName }).ToListAsync();
                var categories = await _db.Categories
                    .Select(c => new { c.Category_Name }).ToListAsync();
                var variants = await _db.Variants
                    .Select(v => new { v.Variant_Name }).ToListAsync();

                return Ok(new { brands, categories, variants });
            }

            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}