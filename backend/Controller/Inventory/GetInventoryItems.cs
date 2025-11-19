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
                // var results = await (from inv in _db.Inventories
                //                      join varnt in _db.Variants on inv.Variant_ID equals varnt.Variant_ID
                //                      join prod in _db.Products on varnt.Product_ID equals prod.Product_ID
                //                      join brand in _db.Brands on prod.Brand_ID equals brand.Brand_ID
                //                      select new
                //                      {
                //                          Product = new DtoProduct
                //                          {
                //                              Product_ID = prod.Product_ID,
                //                              ProductCode = prod.Product_Code,
                //                              ProductName = prod.Product_Name,
                //                              Description = prod.Description,
                //                              Brand_Id = prod.Brand_ID,
                //                              Category_Id = prod.Category_ID,
                //                              CreatedAt = prod.CreatedAt,
                //                              UpdatedAt = prod.UpdatedAt
                //                          },
                //                          Variant = new DtoVariant
                //                          {
                //                              ProductId = varnt.Product_ID,
                //                              VariantName = varnt.Variant_Name,
                //                              CreatedAt = varnt.CreatedAt,
                //                              UpdatedAt = varnt.UpdatedAt
                //                          },
                //                          Brand = new DtoBrand
                //                          {
                //                              BrandName = brand.BrandName,
                //                              CreatedAt = brand.CreatedAt,
                //                              UpdatedAt = brand.UpdatedAt
                //                          },
                //                      })
                //                      .ToListAsync();

                // var results = await _db.Inventories
                //     .Include(i => i.va)

                // if (results == null || !results.Any())
                // {
                //     return NotFound("No inventory products found.");
                // }

                // return Ok(results);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}