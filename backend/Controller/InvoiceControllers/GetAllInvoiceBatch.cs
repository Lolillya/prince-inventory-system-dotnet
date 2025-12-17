// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading.Tasks;
// using backend.Data;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// namespace backend.Controller.InvoiceControllers
// {
//     [ApiController]
//     [Route("api/invoice/restock-batches")]
//     public class GetAllInvoiceBatch : ControllerBase
//     {
//         private readonly ApplicationDBContext _db;

//         public GetAllInvoiceBatch(ApplicationDBContext db)
//         {
//             _db = db;
//         }

//         [HttpGet]
//         public async Task<IActionResult> GetAll()
//         {
//             try
//             {
//                 var productUOMs = await _db.Product_UOMs
//                     .Include(puom => puom.Product)
//                         .ThenInclude(p => p.Brand)
//                     .Include(puom => puom.Product)
//                         .ThenInclude(p => p.Variant)
//                     .Include(puom => puom.Product)
//                         .ThenInclude(p => p.Category)
//                     .Include(puom => puom.RestockBatch)
//                     .Include(puom => puom.UnitOfMeasure)
//                     .ToListAsync();

//                 var results = productUOMs
//                     .GroupBy(puom => new { puom.Product_Id, puom.Batch_Id })
//                     .Select(g => new
//                     {
//                         Product = new
//                         {
//                             Product_ID = g.First().Product.Product_ID,
//                             Product_Code = g.First().Product.Product_Code,
//                             Product_Name = g.First().Product.Product_Name,
//                             Description = g.First().Product.Description,
//                             Brand_ID = g.First().Product.Brand_ID,
//                             Category_ID = g.First().Product.Category_ID,
//                             Variant_ID = g.First().Product.Variant_ID,
//                             CreatedAt = g.First().Product.CreatedAt,
//                             UpdatedAt = g.First().Product.UpdatedAt,
//                             Brand = new
//                             {
//                                 Brand_ID = g.First().Product.Brand.Brand_ID,
//                                 BrandName = g.First().Product.Brand.BrandName,
//                                 CreatedAt = g.First().Product.Brand.CreatedAt,
//                                 UpdatedAt = g.First().Product.Brand.UpdatedAt
//                             },
//                             Variant = new
//                             {
//                                 Variant_ID = g.First().Product.Variant.Variant_ID,
//                                 ProductId = g.First().Product.Product_ID,
//                                 Variant_Name = g.First().Product.Variant.Variant_Name,
//                                 CreatedAt = g.First().Product.Variant.CreatedAt,
//                                 UpdatedAt = g.First().Product.Variant.UpdatedAt
//                             },
//                             Category = new
//                             {
//                                 Category_ID = g.First().Product.Category.Category_ID,
//                                 CategoryName = g.First().Product.Category.Category_Name,
//                                 CreatedAt = g.First().Product.Category.CreatedAt,
//                                 UpdatedAt = g.First().Product.Category.UpdatedAt
//                             }
//                         },
//                         Units = g.Select(x => new
//                         {
//                             UoM_Name = x.UnitOfMeasure.uom_Name,
//                             Conversion_Factor = x.Conversion_Factor,
//                             Price = x.Price
//                         }).ToList(),
//                         RestockBatch = new
//                         {
//                             Batch_ID = g.First().RestockBatch.Batch_ID,
//                             Batch_Number = g.First().RestockBatch.Batch_Number,
//                             Supplier_ID = g.First().RestockBatch.Supplier_ID,
//                             CreatedAt = g.First().RestockBatch.CreatedAt,
//                             UpdatedAt = g.First().RestockBatch.UpdatedAt
//                         }
//                     })
//                     .ToList();

//                 return Ok(results);
//             }
//             catch (Exception e)
//             {
//                 return StatusCode(500, $"Internal server error: {e.Message}");
//             }
//         }
//     }
// }