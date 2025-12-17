// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading.Tasks;
// using backend.Data;
// using backend.Dtos.Inventory;
// using backend.Models.RestockModel;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// namespace backend.Controller.RestockControllers
// {
//     [ApiController]
//     [Route("api/restock/get-all")]
//     public class GetAllRestocks : ControllerBase
//     {
//         private readonly ApplicationDBContext _db;

//         public GetAllRestocks(ApplicationDBContext db)
//         {
//             _db = db;
//         }

//         [HttpGet]
//         public async Task<IActionResult> GetAll()
//         {
//             try
//             {
//                 var results = await _db.Restocks
//                     .Include(u => u.LineItems)
//                         .ThenInclude(u => u.Product)
//                     .Include(u => u.restockBatch)
//                         .ThenInclude(u => u.Supplier)
//                     .Select(u => new
//                     {
//                         grand_total = u.LineItems_Total,
//                         restock_Id = u.Restock_ID,

//                         line_Items = u.LineItems.Select(li => new
//                         {
//                             li.LineItem_ID,
//                             li.Product_ID,
//                             li.Restock_ID,
//                             Product = new
//                             {
//                                 li.Product.Product_ID,
//                                 li.Product.Product_Code,
//                                 li.Product.Product_Name,
//                                 li.Product.Description,
//                                 li.Product.Brand_ID,
//                                 li.Product.Category_ID,
//                                 li.Product.Variant_ID,
//                                 li.Product.CreatedAt,
//                                 li.Product.UpdatedAt
//                             },
//                             li.uom_ID,
//                             li.Unit_Price,
//                             li.Sub_Total,
//                             li.Quantity
//                         }).ToList(),

//                         supplier = new
//                         {
//                             u.restockBatch.Supplier.Id,
//                             u.restockBatch.Supplier.FirstName,
//                             u.restockBatch.Supplier.LastName,
//                             u.restockBatch.Supplier.CompanyName,
//                             u.restockBatch.Supplier.Email
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