using System.Text.Json;
using backend.Data;
using backend.Dtos.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Inventory
{
    [ApiController]
    [Route("api/add-product")]
    public class AddNewProduct : ControllerBase
    {
        private readonly ApplicationDBContext _db;
        public AddNewProduct(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPost]
        public IActionResult AddProduct([FromBody] NewInventoryProductDto newInventoryProductDto)
        {
            Console.WriteLine("Received new product: {0}", JsonSerializer.Serialize(newInventoryProductDto));

            return Ok(new { message = "Product added successfully" });
        }
    }
}