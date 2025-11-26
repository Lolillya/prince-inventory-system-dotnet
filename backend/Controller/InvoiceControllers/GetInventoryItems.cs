using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.InvoiceControllers
{
    [ApiController]
    [Route("api/get-inventory-items")]
    public class GetInventoryItems : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetInventoryItems(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetItems()
        {
            try
            {
                var inventoryItems = await _db.Inventory
                    .Include(i => i.Product).ThenInclude(p => p.Brand)
                    .Include(i => i.Product).ThenInclude(p => p.Category)
                    .Include(i => i.Product).ThenInclude(p => p.Variant)
                    .Select(i => new
                    {
                        InventoryId = i.Inventory_ID,
                        Product = new
                        {
                            i.Product.Product_ID,
                            i.Product.Product_Name,
                            i.Product.Product_Code,
                            i.Product.Description,
                            Brand = i.Product.Brand != null ? new
                            {
                                i.Product.Brand.Brand_ID,
                                i.Product.Brand.BrandName
                            } : null,
                            Category = i.Product.Category != null ? new
                            {
                                i.Product.Category.Category_ID,
                                i.Product.Category.Category_Name
                            } : null,
                            Variant = i.Product.Variant != null ? new
                            {
                                i.Product.Variant.Variant_ID,
                                i.Product.Variant.Variant_Name
                            } : null,
                            UnitsOfMeasure = _db.Product_UOMs
                                .Where(pu => pu.Product_Id == i.Product_ID)
                                .Include(pu => pu.UnitOfMeasure)
                                .Select(pu => new
                                {
                                    pu.UnitOfMeasure.uom_ID,
                                    pu.UnitOfMeasure.uom_Name,
                                    pu.Conversion_Factor,
                                    pu.Price
                                }).ToList(),
                            RestockInfo = _db.RestockLineItems
                                .Where(rli => rli.Product_ID == i.Product_ID)
                                .Include(rli => rli.Restock)
                                .ThenInclude(r => r.Clerk)
                                .Include(rli => rli.Restock)
                                .ThenInclude(r => r.restockBatch)
                                .Select(rli => new
                                {
                                    RestockId = rli.Restock_ID,
                                    Clerk = rli.Restock.Clerk != null ? new
                                    {
                                        rli.Restock.Clerk.Id,
                                        rli.Restock.Clerk.FirstName,
                                        rli.Restock.Clerk.LastName
                                    } : null,
                                    BatchId = rli.Restock.Batch_ID,
                                    BatchNumber = rli.Restock.restockBatch.Batch_Number
                                })
                                .ToList()
                        },
                        RestockBatchCount = _db.RestockLineItems
                            .Where(rli => rli.Product_ID == i.Product_ID)
                            .Select(rli => rli.Restock.Batch_ID)
                            .Distinct()
                            .Count()
                    })
                    .ToListAsync();

                return Ok(inventoryItems);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}