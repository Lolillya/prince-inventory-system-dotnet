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
                var results = await _db.Products
                    .Include(p => p.Brand)
                    .Include(p => p.Category)
                    .Include(p => p.Variant)
                    .Select(p => new
                    {
                        p.Variant.Variant_Name,
                        p.Brand.BrandName,
                        p.Category.Category_Name
                    }).ToListAsync();

                return Ok(results);
            }

            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}