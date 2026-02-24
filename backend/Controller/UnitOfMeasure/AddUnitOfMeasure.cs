using System;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos.UnitOfMeasure;
using UnitModel = backend.Models.Unit.UnitOfMeasure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.UnitOfMeasure
{
    [ApiController]
    [Route("api/uom-add")]
    public class AddUnitOfMeasure : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public AddUnitOfMeasure(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> CreateUnitOfMeasure([FromBody] CreateUnitOfMeasureDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Normalize the unit name to uppercase for consistency
                var normalizedName = dto.Uom_Name.Trim().ToUpper();

                // Check if unit already exists
                var existingUnit = await _db.UnitOfMeasure
                    .FirstOrDefaultAsync(u => u.uom_Name.ToUpper() == normalizedName);

                if (existingUnit != null)
                {
                    return Conflict(new { message = $"Unit '{normalizedName}' already exists" });
                }

                // Create new unit
                var newUnit = new UnitModel
                {
                    uom_Name = normalizedName
                };

                _db.UnitOfMeasure.Add(newUnit);
                await _db.SaveChangesAsync();

                var response = new CreateUnitOfMeasureResponseDto
                {
                    Uom_ID = newUnit.uom_ID,
                    Uom_Name = newUnit.uom_Name,
                    Message = "Unit of measure created successfully"
                };

                return CreatedAtAction(nameof(CreateUnitOfMeasure), new { id = newUnit.uom_ID }, response);
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}
