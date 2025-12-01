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
                    .Select(b => new
                    {
                        BrandName = b.BrandName,
                        Brand_ID = b.Brand_ID
                    }).ToListAsync();
                var categories = await _db.Categories
                    .Select(c => new
                    {
                        Category_Name = c.Category_Name,
                        Category_ID = c.Category_ID
                    }).ToListAsync();
                var variants = await _db.Variants
                    .Select(v => new
                    {
                        Variant_Name = v.Variant_Name,
                        Variant_ID = v.Variant_ID
                    }).ToListAsync();
                return Ok(new { brands, categories, variants });
            }

            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}