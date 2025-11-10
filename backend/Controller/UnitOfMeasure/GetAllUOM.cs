using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models.Unit;

namespace backend.Controller.UnitOfMeasure
{
    [ApiController]
    [Route("api/uom-get-all")]
    public class GetAllUOM : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetAllUOM(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUnits()
        {
            try
            {
                var results = await _db.UnitOfMeasure
                    .Select(u => new
                    {
                        Id = u.uom_ID,
                        Name = u.uom_Name
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