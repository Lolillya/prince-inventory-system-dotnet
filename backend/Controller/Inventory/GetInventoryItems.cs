using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using System.Numerics;
using DtoBrand = backend.Dtos.Inventory.Brand;
using DtoCategory = backend.Dtos.Inventory.Category;
using DtoProduct = backend.Dtos.Inventory.Product;
using DtoVariant = backend.Dtos.Inventory.Variant;
using DtoInventory = backend.Dtos.Inventory.Inventory;

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
                        .ThenInclude(i => i.Brand)
                    .Include(i => i.Product)
                        .ThenInclude(i => i.Variant)
                    .Include(i => i.Product)
                        .ThenInclude(i => i.Category)
                    .Select(i => new
                    {
                        Product = new DtoProduct
                        {
                            Product_ID = i.Product_ID,
                            ProductCode = i.Product.Product_Code,
                            ProductName = i.Product.Product_Name,
                            Description = i.Product.Description,
                            Brand_Id = i.Product.Brand.Brand_ID,
                            Category_Id = i.Product.Category.Category_ID,
                            CreatedAt = i.Created_At,
                            UpdatedAt = i.Updated_At
                        },
                        Variant = new DtoVariant
                        {
                            VariantName = i.Product.Variant.Variant_Name,
                            CreatedAt = i.Product.Variant.CreatedAt,
                            UpdatedAt = i.Product.Variant.UpdatedAt
                        },
                        Brand = new DtoBrand
                        {
                            BrandName = i.Product.Brand.BrandName,
                            CreatedAt = i.Product.Brand.CreatedAt,
                            UpdatedAt = i.Product.Brand.UpdatedAt
                        },
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