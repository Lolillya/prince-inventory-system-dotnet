
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.Inventory;

namespace backend.Controller.Inventory
{
    [Route("api/inventory/")]
    [ApiController]
    public class GetInventoryItems : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetInventoryItems(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllInventoryProducts()
        {
            try
            {
                var results = await _db.Inventory
                    .Include(i => i.Product)
                    .Select(i => new
                    {
                        Product = new
                        {
                            i.Product_ID,
                            i.Product.Product_Code,
                            i.Product.Product_Name,
                            i.Product.Description,
                            CreatedAt = i.Created_At,
                            UpdatedAt = i.Updated_At
                        },
                        Variant = new
                        {
                            i.Product.Variant.Variant_ID,
                            i.Product.Variant.Variant_Name,
                            i.Product.Variant.CreatedAt,
                            i.Product.Variant.UpdatedAt
                        },
                        Brand = new
                        {
                            i.Product.Brand.Brand_ID,
                            i.Product.Brand.BrandName,
                            i.Product.Brand.CreatedAt,
                            i.Product.Brand.UpdatedAt
                        },
                        Category = new
                        {
                            i.Product.Category.Category_ID,
                            i.Product.Category.Category_Name,
                            i.Product.Category.CreatedAt,
                            i.Product.Category.UpdatedAt
                        }
                    }).ToListAsync();

                if (results == null || !results.Any())
                {
                    return NotFound("No inventory products found.");
                }

                return Ok(results);
                // return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}