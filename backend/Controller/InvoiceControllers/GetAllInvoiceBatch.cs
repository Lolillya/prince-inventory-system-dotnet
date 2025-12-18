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
                    .GroupBy(rli => new { rli.Product_ID, rli.Batch_ID })
                    .Select(g => new
                    {
                        Product = new
                        {
                            Product_ID = g.First().Product.Product_ID,
                            Product_Code = g.First().Product.Product_Code,
                            Product_Name = g.First().Product.Product_Name,
                            Description = g.First().Product.Description,
                            Brand_ID = g.First().Product.Brand_ID,
                            Category_ID = g.First().Product.Category_ID,
                            Variant_ID = g.First().Product.Variant_ID,
                            CreatedAt = g.First().Product.CreatedAt,
                            UpdatedAt = g.First().Product.UpdatedAt,
                            Brand = g.First().Product.Brand != null ? new
                            {
                                Brand_ID = g.First().Product.Brand.Brand_ID,
                                BrandName = g.First().Product.Brand.BrandName,
                                CreatedAt = g.First().Product.Brand.CreatedAt,
                                UpdatedAt = g.First().Product.Brand.UpdatedAt
                            } : null,
                            Variant = g.First().Product.Variant != null ? new
                            {
                                Variant_ID = g.First().Product.Variant.Variant_ID,
                                ProductId = g.First().Product.Product_ID,
                                Variant_Name = g.First().Product.Variant.Variant_Name,
                                CreatedAt = g.First().Product.Variant.CreatedAt,
                                UpdatedAt = g.First().Product.Variant.UpdatedAt
                            } : null,
                            Category = g.First().Product.Category != null ? new
                            {
                                Category_ID = g.First().Product.Category.Category_ID,
                                CategoryName = g.First().Product.Category.Category_Name,
                                CreatedAt = g.First().Product.Category.CreatedAt,
                                UpdatedAt = g.First().Product.Category.UpdatedAt
                            } : null
                        },
                        BaseUnit = g.First().BaseUnitOfMeasure != null ? new
                        {
                            UoM_ID = g.First().BaseUnitOfMeasure.uom_ID,
                            UoM_Name = g.First().BaseUnitOfMeasure.uom_Name,
                            Unit_Price = g.First().Base_Unit_Price,
                            Unit_Quantity = g.First().Base_Unit_Quantity
                        } : null,
                        UnitConversions = g.First().ProductUOMs.Select(puom => new
                        {
                            UoM_ID = puom.UnitOfMeasure.uom_ID,
                            UoM_Name = puom.UnitOfMeasure.uom_Name,
                            Parent_UOM_ID = puom.Parent_UOM_ID,
                            Parent_UoM_Name = puom.ParentUnitOfMeasure != null ? puom.ParentUnitOfMeasure.uom_Name : null,
                            Conversion_Factor = puom.Conversion_Factor,
                            Unit_Price = puom.Unit_Price
                        }).ToList(),
                        RestockBatch = new
                        {
                            Batch_ID = g.First().RestockBatch.Batch_ID,
                            Batch_Number = g.First().RestockBatch.Batch_Number,
                            Restock_ID = g.First().RestockBatch.Restock_ID,
                            Restock_Number = g.First().RestockBatch.Restock.Restock_Number,
                            Supplier = g.First().RestockBatch.Supplier != null ? new
                            {
                                Supplier_ID = g.First().RestockBatch.Supplier.Id,
                                FirstName = g.First().RestockBatch.Supplier.FirstName,
                                LastName = g.First().RestockBatch.Supplier.LastName,
                                CompanyName = g.First().RestockBatch.Supplier.CompanyName
                            } : null,
                            CreatedAt = g.First().RestockBatch.CreatedAt,
                            UpdatedAt = g.First().RestockBatch.UpdatedAt
                        }
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