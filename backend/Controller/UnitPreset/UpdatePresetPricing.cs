using backend.Data;
using backend.Models.Unit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.UnitPreset
{
    [ApiController]
    [Route("api/unit-presets/update-pricing")]
    public class UpdatePresetPricing : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public UpdatePresetPricing(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdatePresetPricingDto dto)
        {
            var productPreset = await _db.Product_Unit_Presets
                .Include(p => p.PresetPricing)
                .FirstOrDefaultAsync(p =>
                    p.Preset_ID == dto.Preset_ID &&
                    p.Product_ID == dto.Product_ID);

            if (productPreset == null)
                return NotFound($"No assignment found for product {dto.Product_ID} and preset {dto.Preset_ID}");

            var preset = await _db.Unit_Presets
                .Include(p => p.PresetLevels)
                    .ThenInclude(pl => pl.UnitOfMeasure)
                .FirstOrDefaultAsync(p => p.Preset_ID == dto.Preset_ID);

            if (preset == null)
                return NotFound($"Preset {dto.Preset_ID} not found");

            foreach (var unitPrice in dto.UnitPrices)
            {
                var presetLevel = preset.PresetLevels
                    .FirstOrDefault(pl =>
                        pl.UnitOfMeasure.uom_Name.Equals(
                            unitPrice.UnitName, StringComparison.OrdinalIgnoreCase));

                if (presetLevel == null) continue;

                var existing = productPreset.PresetPricing
                    .FirstOrDefault(pp => pp.Level == presetLevel.Level);

                if (existing != null)
                {
                    existing.Price_Per_Unit = unitPrice.Price;
                    existing.Updated_At = DateTime.UtcNow;
                }
                else
                {
                    await _db.Product_Unit_Preset_Pricing.AddAsync(new Product_Unit_Preset_Pricing
                    {
                        Product_Preset_ID = productPreset.Product_Preset_ID,
                        Level = presetLevel.Level,
                        UOM_ID = presetLevel.UOM_ID,
                        Price_Per_Unit = unitPrice.Price,
                        Created_At = DateTime.UtcNow,
                        Updated_At = DateTime.UtcNow
                    });
                }
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = "Pricing updated successfully" });
        }
    }

    public class UpdatePresetPricingDto
    {
        public int Preset_ID { get; set; }
        public int Product_ID { get; set; }
        public List<UnitPriceUpdateDto> UnitPrices { get; set; } = new();
    }

    public class UnitPriceUpdateDto
    {
        public string UnitName { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}
