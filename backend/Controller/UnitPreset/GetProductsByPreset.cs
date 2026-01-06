using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.UnitPreset
{
    [ApiController]
    [Route("api/unit-presets/{presetId}/products")]
    public class GetProductsByPreset : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetProductsByPreset(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts(int presetId)
        {
            try
            {
                var products = await _db.Product_Unit_Presets
                    .Where(p => p.Preset_ID == presetId)
                    .Include(p => p.Product)
                        .ThenInclude(prod => prod.Brand)
                    .Include(p => p.Product)
                        .ThenInclude(prod => prod.Category)
                    .Include(p => p.Product)
                        .ThenInclude(prod => prod.Variant)
                    .Select(p => new
                    {
                        product_ID = p.Product.Product_ID,
                        product_Code = p.Product.Product_Code,
                        product_Name = p.Product.Product_Name,
                        description = p.Product.Description,
                        brand = new
                        {
                            brand_ID = p.Product.Brand.Brand_ID,
                            brand_Name = p.Product.Brand.Brand_Name
                        },
                        category = new
                        {
                            category_ID = p.Product.Category.Category_ID,
                            category_Name = p.Product.Category.Category_Name
                        },
                        variant = new
                        {
                            variant_ID = p.Product.Variant.Variant_ID,
                            variant_Name = p.Product.Variant.Variant_Name
                        },
                        assigned_At = p.Assigned_At
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}
