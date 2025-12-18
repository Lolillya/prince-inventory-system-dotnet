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
    [Route("api/invoice/restock-batches")]
    public class GetAllInvoiceBatch : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetAllInvoiceBatch(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var restockLineItems = await _db.RestockLineItems
                    .Include(rli => rli.Product)
                        .ThenInclude(p => p.Brand)
                    .Include(rli => rli.Product)
                        .ThenInclude(p => p.Variant)
                    .Include(rli => rli.Product)
                        .ThenInclude(p => p.Category)
                    .Include(rli => rli.RestockBatch)
                        .ThenInclude(rb => rb.Supplier)
                    .Include(rli => rli.RestockBatch)
                        .ThenInclude(rb => rb.Restock)
                    .Include(rli => rli.BaseUnitOfMeasure)
                    .Include(rli => rli.ProductUOMs)
                        .ThenInclude(puom => puom.UnitOfMeasure)
                    .Include(rli => rli.ProductUOMs)
                        .ThenInclude(puom => puom.ParentUnitOfMeasure)
                    .ToListAsync();

                var results = restockLineItems
                    .GroupBy(rli => rli.Product_ID)
                    .Select(productGroup => new
                    {
                        Product = new
                        {
                            Product_ID = productGroup.First().Product.Product_ID,
                            Product_Code = productGroup.First().Product.Product_Code,
                            Product_Name = productGroup.First().Product.Product_Name,
                            Description = productGroup.First().Product.Description,
                            Brand_ID = productGroup.First().Product.Brand_ID,
                            Category_ID = productGroup.First().Product.Category_ID,
                            Variant_ID = productGroup.First().Product.Variant_ID,
                            CreatedAt = productGroup.First().Product.CreatedAt,
                            UpdatedAt = productGroup.First().Product.UpdatedAt,
                            Brand = productGroup.First().Product.Brand != null ? new
                            {
                                Brand_ID = productGroup.First().Product.Brand.Brand_ID,
                                BrandName = productGroup.First().Product.Brand.BrandName,
                                CreatedAt = productGroup.First().Product.Brand.CreatedAt,
                                UpdatedAt = productGroup.First().Product.Brand.UpdatedAt
                            } : null,
                            Variant = productGroup.First().Product.Variant != null ? new
                            {
                                Variant_ID = productGroup.First().Product.Variant.Variant_ID,
                                ProductId = productGroup.First().Product.Product_ID,
                                Variant_Name = productGroup.First().Product.Variant.Variant_Name,
                                CreatedAt = productGroup.First().Product.Variant.CreatedAt,
                                UpdatedAt = productGroup.First().Product.Variant.UpdatedAt
                            } : null,
                            Category = productGroup.First().Product.Category != null ? new
                            {
                                Category_ID = productGroup.First().Product.Category.Category_ID,
                                CategoryName = productGroup.First().Product.Category.Category_Name,
                                CreatedAt = productGroup.First().Product.Category.CreatedAt,
                                UpdatedAt = productGroup.First().Product.Category.UpdatedAt
                            } : null
                        },
                        Batches = productGroup
                            .GroupBy(rli => rli.Batch_ID)
                            .Select(batchGroup => new
                            {
                                Batch_ID = batchGroup.First().RestockBatch.Batch_ID,
                                Batch_Number = batchGroup.First().RestockBatch.Batch_Number,
                                Restock = new
                                {
                                    Restock_ID = batchGroup.First().RestockBatch.Restock_ID,
                                    Restock_Number = batchGroup.First().RestockBatch.Restock.Restock_Number,
                                    CreatedAt = batchGroup.First().RestockBatch.Restock.CreatedAt,
                                    UpdatedAt = batchGroup.First().RestockBatch.Restock.UpdatedAt
                                },
                                Supplier = batchGroup.First().RestockBatch.Supplier != null ? new
                                {
                                    Supplier_ID = batchGroup.First().RestockBatch.Supplier.Id,
                                    FirstName = batchGroup.First().RestockBatch.Supplier.FirstName,
                                    LastName = batchGroup.First().RestockBatch.Supplier.LastName,
                                    CompanyName = batchGroup.First().RestockBatch.Supplier.CompanyName,
                                    Email = batchGroup.First().RestockBatch.Supplier.Email
                                } : null,
                                BaseUnit = batchGroup.First().BaseUnitOfMeasure != null ? new
                                {
                                    UoM_ID = batchGroup.First().BaseUnitOfMeasure.uom_ID,
                                    UoM_Name = batchGroup.First().BaseUnitOfMeasure.uom_Name,
                                    Unit_Price = batchGroup.First().Base_Unit_Price,
                                    Unit_Quantity = batchGroup.First().Base_Unit_Quantity
                                } : null,
                                UnitConversions = batchGroup.First().ProductUOMs.Select(puom => new
                                {
                                    Product_UOM_Id = puom.Product_UOM_Id,
                                    UoM_ID = puom.UnitOfMeasure.uom_ID,
                                    UoM_Name = puom.UnitOfMeasure.uom_Name,
                                    Parent_UOM_ID = puom.Parent_UOM_ID,
                                    Parent_UoM_Name = puom.ParentUnitOfMeasure != null ? puom.ParentUnitOfMeasure.uom_Name : null,
                                    Conversion_Factor = puom.Conversion_Factor,
                                    Unit_Price = puom.Unit_Price
                                }).ToList(),
                                CreatedAt = batchGroup.First().RestockBatch.CreatedAt,
                                UpdatedAt = batchGroup.First().RestockBatch.UpdatedAt
                            })
                            .ToList()
                    })
                    .ToList();

                return Ok(results);
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}