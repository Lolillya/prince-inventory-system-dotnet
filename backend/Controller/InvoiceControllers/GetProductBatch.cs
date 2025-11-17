using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.InvoiceControllers
{
    [ApiController]
    [Route("api/invoice/get-batches")]
    public class GetProductBatch : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetProductBatch(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var productUOMs = await _db.Product_UOMs
                    .Include(p => p.Product)
                        .ThenInclude(product => product.Brand)
                    .Include(p => p.Product)
                        .ThenInclude(product => product.Variant)
                    .Include(p => p.Product)
                        .ThenInclude(product => product.Category)
                    .Include(p => p.RestockBatch)
                    .Include(p => p.UnitOfMeasure)
                    .ToListAsync();

                var results = productUOMs
                    .GroupBy(p => new { p.Product_Id, p.Batch_Id })
                    .Select(g => new
                    {
                        Product = g.First().Product,
                        Units = g.Select(x => new
                        {
                            UOM_Name = x.UnitOfMeasure.uom_Name,
                            Conversion_Factor = x.Conversion_Factor,
                            Price = x.Price
                        }).ToList(),
                        RestockBatch = g.First().RestockBatch
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