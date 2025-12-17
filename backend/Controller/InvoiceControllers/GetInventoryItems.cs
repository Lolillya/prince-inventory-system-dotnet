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
                            UnitsOfMeasure = _db.RestockLineItems
                                .Where(rli => rli.Product_ID == i.Product_ID)
                                .SelectMany(rli => rli.ProductUOMs)
                                .Include(puom => puom.UnitOfMeasure)
                                .Include(puom => puom.ParentUnitOfMeasure)
                                .Select(puom => new
                                {
                                    puom.UnitOfMeasure.uom_ID,
                                    puom.UnitOfMeasure.uom_Name,
                                    puom.Conversion_Factor,
                                    puom.Unit_Price,
                                    ParentUOM = puom.ParentUnitOfMeasure != null ? new
                                    {
                                        puom.ParentUnitOfMeasure.uom_ID,
                                        puom.ParentUnitOfMeasure.uom_Name
                                    } : null
                                }).ToList(),
                            RestockInfo = _db.RestockLineItems
                                .Where(rli => rli.Product_ID == i.Product_ID)
                                .Include(rli => rli.RestockBatch)
                                .ThenInclude(rb => rb.Restock)
                                .ThenInclude(r => r.Clerk)
                                .Include(rli => rli.RestockBatch)
                                .ThenInclude(rb => rb.Supplier)
                                .Select(rli => new
                                {
                                    RestockId = rli.RestockBatch.Restock_ID,
                                    RestockNumber = rli.RestockBatch.Restock.Restock_Number,
                                    Clerk = rli.RestockBatch.Restock.Clerk != null ? new
                                    {
                                        rli.RestockBatch.Restock.Clerk.Id,
                                        rli.RestockBatch.Restock.Clerk.FirstName,
                                        rli.RestockBatch.Restock.Clerk.LastName
                                    } : null,
                                    BatchId = rli.Batch_ID,
                                    BatchNumber = rli.RestockBatch.Batch_Number,
                                    Supplier = rli.RestockBatch.Supplier != null ? new
                                    {
                                        rli.RestockBatch.Supplier.Id,
                                        rli.RestockBatch.Supplier.FirstName,
                                        rli.RestockBatch.Supplier.LastName,
                                        rli.RestockBatch.Supplier.CompanyName
                                    } : null,
                                    rli.Base_Unit_Price,
                                    rli.Base_Unit_Quantity
                                })
                                .ToList()
                        },
                        RestockBatchCount = _db.RestockLineItems
                            .Where(rli => rli.Product_ID == i.Product_ID)
                            .Select(rli => rli.Batch_ID)
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