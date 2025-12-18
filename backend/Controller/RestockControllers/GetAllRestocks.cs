using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos.Inventory;
using backend.Models.RestockModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.RestockControllers
{
    [ApiController]
    [Route("api/restock/get-all")]
    public class GetAllRestocks : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetAllRestocks(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                // var results = await _db.Restocks
                //     .Include(r => r.Clerk)
                //     .Include(r => r.RestockBatches)
                //         .ThenInclude(rb => rb.Supplier)
                //     .Include(r => r.RestockBatches)
                //         .ThenInclude(rb => rb.RestockLineItems)
                //             .ThenInclude(rli => rli.Product)
                //                 .ThenInclude(p => p.Brand)
                //     .Include(r => r.RestockBatches)
                //         .ThenInclude(rb => rb.RestockLineItems)
                //             .ThenInclude(rli => rli.Product)
                //                 .ThenInclude(p => p.Category)
                //     .Include(r => r.RestockBatches)
                //         .ThenInclude(rb => rb.RestockLineItems)
                //             .ThenInclude(rli => rli.Product)
                //                 .ThenInclude(p => p.Variant)
                //     .Include(r => r.RestockBatches)
                //         .ThenInclude(rb => rb.RestockLineItems)
                //             .ThenInclude(rli => rli.BaseUnitOfMeasure)
                //     .Include(r => r.RestockBatches)
                //         .ThenInclude(rb => rb.RestockLineItems)
                //             .ThenInclude(rli => rli.ProductUOMs)
                //                 .ThenInclude(puom => puom.UnitOfMeasure)
                //     .Select(r => new
                //     {
                //         restock_Id = r.Restock_ID,
                //         restock_Number = r.Restock_Number,
                //         restock_Notes = r.Restock_Notes,
                //         clerk = r.Clerk != null ? new
                //         {
                //             r.Clerk.Id,
                //             r.Clerk.FirstName,
                //             r.Clerk.LastName,
                //             r.Clerk.Email
                //         } : null,
                //         suppliers = r.RestockBatches
                //             .Where(rb => rb.Supplier != null)
                //             .Select(rb => new
                //             {
                //                 rb.Supplier.Id,
                //                 rb.Supplier.FirstName,
                //                 rb.Supplier.LastName,
                //                 rb.Supplier.CompanyName,
                //                 rb.Supplier.Email
                //             })
                //             .Distinct()
                //             .ToList(),
                //         created_At = r.CreatedAt,
                //         updated_At = r.UpdatedAt,

                //         line_Items = r.RestockBatches
                //             .SelectMany(rb => rb.RestockLineItems.Select(rli => new
                //             {
                //                 line_Item_ID = rli.LineItem_ID,
                //                 batch_Id = rb.Batch_ID,
                //                 batch_Number = rb.Batch_Number,
                //                 product = rli.Product != null ? new
                //                 {
                //                     rli.Product.Product_ID,
                //                     rli.Product.Product_Code,
                //                     rli.Product.Product_Name,
                //                     rli.Product.Description,
                //                     brand = rli.Product.Brand != null ? new
                //                     {
                //                         rli.Product.Brand.Brand_ID,
                //                         rli.Product.Brand.BrandName
                //                     } : null,
                //                     category = rli.Product.Category != null ? new
                //                     {
                //                         rli.Product.Category.Category_ID,
                //                         rli.Product.Category.Category_Name
                //                     } : null,
                //                     variant = rli.Product.Variant != null ? new
                //                     {
                //                         rli.Product.Variant.Variant_ID,
                //                         rli.Product.Variant.Variant_Name
                //                     } : null
                //                 } : null,
                //                 base_Unit = rli.BaseUnitOfMeasure != null ? new
                //                 {
                //                     rli.BaseUnitOfMeasure.uom_ID,
                //                     rli.BaseUnitOfMeasure.uom_Name
                //                 } : null,
                //                 base_Unit_Price = rli.Base_Unit_Price,
                //                 base_Unit_Quantity = rli.Base_Unit_Quantity,
                //                 line_Item_Total = rli.Base_Unit_Price * rli.Base_Unit_Quantity,

                //                 unit_Conversions = rli.ProductUOMs.Select(puom => new
                //                 {
                //                     product_UOM_Id = puom.Product_UOM_Id,
                //                     unit = puom.UnitOfMeasure != null ? new
                //                     {
                //                         puom.UnitOfMeasure.uom_ID,
                //                         puom.UnitOfMeasure.uom_Name
                //                     } : null,
                //                     parent_UOM_ID = puom.Parent_UOM_ID,
                //                     conversion_Factor = puom.Conversion_Factor,
                //                     unit_Price = puom.Unit_Price
                //                 }).ToList()
                //             }))
                //             .ToList(),

                //         grand_Total = r.RestockBatches
                //             .SelectMany(rb => rb.RestockLineItems)
                //             .Sum(rli => rli.Base_Unit_Price * rli.Base_Unit_Quantity)
                //     })
                //     .ToListAsync();

                var results = await _db.Restocks
                    .Include(r => r.Clerk)
                    .Include(r => r.RestockBatches)
                        .ThenInclude(rb => rb.Supplier)
                    .Include(r => r.RestockBatches)
                        .ThenInclude(rb => rb.RestockLineItems)
                            .ThenInclude(rli => rli.Product)
                                .ThenInclude(p => p.Brand)
                    .Include(r => r.RestockBatches)
                        .ThenInclude(rb => rb.RestockLineItems)
                            .ThenInclude(rli => rli.Product)
                                .ThenInclude(p => p.Category)
                    .Include(r => r.RestockBatches)
                        .ThenInclude(rb => rb.RestockLineItems)
                            .ThenInclude(rli => rli.Product)
                                .ThenInclude(p => p.Variant)
                    .Include(r => r.RestockBatches)
                        .ThenInclude(rb => rb.RestockLineItems)
                            .ThenInclude(rli => rli.BaseUnitOfMeasure)
                    .Include(r => r.RestockBatches)
                        .ThenInclude(rb => rb.RestockLineItems)
                            .ThenInclude(rli => rli.ProductUOMs)
                                .ThenInclude(puom => puom.UnitOfMeasure)
                    .Select(r => new
                    {
                        restock_Id = r.Restock_ID,
                        restock_Number = r.Restock_Number,
                        restock_Notes = r.Restock_Notes,
                        clerk = r.Clerk != null ? new
                        {
                            r.Clerk.Id,
                            r.Clerk.FirstName,
                            r.Clerk.LastName,
                            r.Clerk.Email
                        } : null,
                        supplier = r.RestockBatches
                            .Where(rb => rb.Supplier != null)
                            .Select(rb => new
                            {
                                rb.Supplier.Id,
                                rb.Supplier.FirstName,
                                rb.Supplier.LastName,
                                rb.Supplier.CompanyName,
                                rb.Supplier.Email
                            })
                            .FirstOrDefault(),
                        created_At = r.CreatedAt,
                        updated_At = r.UpdatedAt,

                        line_Items = r.RestockBatches
                            .SelectMany(rb => rb.RestockLineItems.Select(rli => new
                            {
                                line_Item_ID = rli.LineItem_ID,
                                batch_Id = rb.Batch_ID,
                                batch_Number = rb.Batch_Number,
                                product = rli.Product != null ? new
                                {
                                    rli.Product.Product_ID,
                                    rli.Product.Product_Code,
                                    rli.Product.Product_Name,
                                    rli.Product.Description,
                                    brand = rli.Product.Brand != null ? new
                                    {
                                        rli.Product.Brand.Brand_ID,
                                        rli.Product.Brand.BrandName
                                    } : null,
                                    category = rli.Product.Category != null ? new
                                    {
                                        rli.Product.Category.Category_ID,
                                        rli.Product.Category.Category_Name
                                    } : null,
                                    variant = rli.Product.Variant != null ? new
                                    {
                                        rli.Product.Variant.Variant_ID,
                                        rli.Product.Variant.Variant_Name
                                    } : null
                                } : null,
                                base_Unit = rli.BaseUnitOfMeasure != null ? new
                                {
                                    rli.BaseUnitOfMeasure.uom_ID,
                                    rli.BaseUnitOfMeasure.uom_Name
                                } : null,
                                base_Unit_Price = rli.Base_Unit_Price,
                                base_Unit_Quantity = rli.Base_Unit_Quantity,
                                line_Item_Total = rli.Base_Unit_Price * rli.Base_Unit_Quantity,

                                unit_Conversions = rli.ProductUOMs.Select(puom => new
                                {
                                    product_UOM_Id = puom.Product_UOM_Id,
                                    unit = puom.UnitOfMeasure != null ? new
                                    {
                                        puom.UnitOfMeasure.uom_ID,
                                        puom.UnitOfMeasure.uom_Name
                                    } : null,
                                    parent_UOM_ID = puom.Parent_UOM_ID,
                                    conversion_Factor = puom.Conversion_Factor,
                                    unit_Price = puom.Unit_Price
                                }).ToList()
                            }))
                            .ToList(),

                        grand_Total = r.RestockBatches
                            .SelectMany(rb => rb.RestockLineItems)
                            .Sum(rli => rli.Base_Unit_Price * rli.Base_Unit_Quantity)
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