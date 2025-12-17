// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading.Tasks;
// using backend.Data;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// namespace backend.Controller.RestockControllers
// {
//     [ApiController]
//     [Route("api/inventory-with-batches")]
//     public class GetInventoryWIthBatch : ControllerBase
//     {
//         private readonly ApplicationDBContext _db;

//         public GetInventoryWIthBatch(ApplicationDBContext db)
//         {
//             _db = db;
//         }

//         [HttpGet]
//         public async Task<IActionResult> GetAll()
//         {
//             try
//             {
//                 var results = await _db.Inventory
//                     .Include(i => i.Product)
//                         .ThenInclude(p => p.Brand)
//                     .Include(i => i.Product)
//                         .ThenInclude(p => p.Variant)
//                     .Include(i => i.Product)
//                         .ThenInclude(p => p.Category)
//                     .Select(i => new
//                     {
//                         Product = new
//                         {
//                             i.Product.Product_ID,
//                             Product_Code = i.Product.Product_Code,
//                             Product_Name = i.Product.Product_Name,
//                             Description = i.Product.Description,
//                             Brand_ID = i.Product.Brand_ID,
//                             Category_ID = i.Product.Category_ID,
//                             Variant_ID = i.Product.Variant_ID,
//                             Created_At = i.Product.CreatedAt,
//                             Updated_At = i.Product.UpdatedAt,
//                             Brand = new
//                             {
//                                 Brand_Name = i.Product.Brand.BrandName,
//                                 Created_At = i.Product.Brand.CreatedAt,
//                                 Updated_At = i.Product.Brand.UpdatedAt
//                             },
//                             Variant = new
//                             {
//                                 Variant_Name = i.Product.Variant.Variant_Name,
//                                 Created_At = i.Product.Variant.CreatedAt,
//                                 Updated_At = i.Product.Variant.UpdatedAt
//                             },
//                             Category = new
//                             {
//                                 Category_Name = i.Product.Category.Category_Name,
//                                 Created_At = i.Product.Category.CreatedAt,
//                                 Updated_At = i.Product.Category.UpdatedAt
//                             }
//                         },
//                         TotalBatches = _db.RestockLineItems
//                             .Where(rl => rl.Product_ID == i.Product_ID)
//                             .Select(rl => rl.Restock.Batch_ID)
//                             .Distinct()
//                             .Count(),
//                         Inventory = new
//                         {
//                             i.Inventory_ID,
//                             i.Total_Quantity,
//                             i.Inventory_Number,
//                             Created_At = i.Created_At,
//                             Updated_At = i.Updated_At
//                         }
//                     })
//                     .ToListAsync();

//                 return Ok(results);
//             }
//             catch (Exception e)
//             {
//                 return StatusCode(500, $"Internal server error: {e.Message}");
//             }
//         }
//     }
// }