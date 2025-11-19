using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.RestockControllers
{
    [ApiController]
    [Route("api/inventory-with-batches")]
    public class GetInventoryWIthBatch : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetInventoryWIthBatch(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var results = await _db.Inventory
                    .Include(i => i.Product)
                        .ThenInclude(p => p.Brand)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.Variant)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.Category)
                    .Select(i => new
                    {
                        Product = new
                        {
                            i.Product.Product_ID,
                            Product_Code = i.Product.Product_Code,
                            Product_Name = i.Product.Product_Name,
                            Description = i.Product.Description,
                            Brand_ID = i.Product.Brand_ID,
                            Category_ID = i.Product.Category_ID,
                            Variant_ID = i.Product.Variant_ID,
                            CreatedAt = i.Product.CreatedAt,
                            UpdatedAt = i.Product.UpdatedAt,
                            Brand = new
                            {
                                i.Product.Brand.Brand_ID,
                                BrandName = i.Product.Brand.BrandName,
                                CreatedAt = i.Product.Brand.CreatedAt,
                                UpdatedAt = i.Product.Brand.UpdatedAt
                            },
                            Variant = new
                            {
                                Variant_ID = i.Product.Variant.Variant_ID,
                                ProductId = i.Product.Product_ID,
                                Variant_Name = i.Product.Variant.Variant_Name,
                                CreatedAt = i.Product.Variant.CreatedAt,
                                UpdatedAt = i.Product.Variant.UpdatedAt
                            },
                            Category = new
                            {
                                Category_ID = i.Product.Category.Category_ID,
                                CategoryName = i.Product.Category.Category_Name,
                                CreatedAt = i.Product.Category.CreatedAt,
                                UpdatedAt = i.Product.Category.UpdatedAt
                            }
                        },
                        TotalBatches = _db.RestockLineItems
                            .Where(rl => rl.Product_ID == i.Product_ID)
                            .Select(rl => rl.Restock.Batch_ID)
                            .Distinct()
                            .Count(),
                        Inventory = new
                        {
                            i.Inventory_ID,
                            i.Total_Quantity,
                            i.Inventory_Number,
                            Created_At = i.Created_At,
                            Updated_At = i.Updated_At
                        }
                    })
                    .ToListAsync();

                return Ok(results);
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}