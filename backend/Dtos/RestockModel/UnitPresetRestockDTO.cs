using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.RestockModel
{
    /// <summary>
    /// DTO for creating a restock with unit preset support
    /// </summary>
    public class UnitPresetRestockDTO
    {
        [Required]
        public List<UnitPresetRestockLineItemDto> LineItems { get; set; } = new List<UnitPresetRestockLineItemDto>();

        [Required]
        public string Supplier_ID { get; set; } = null!;

        [Required]
        public string Restock_Clerk { get; set; } = null!;

        public string Notes { get; set; } = "";
    }

    /// <summary>
    /// Line item for a restock using unit preset
    /// </summary>
    public class UnitPresetRestockLineItemDto
    {
        [Required]
        public int Product_ID { get; set; }

        [Required]
        public int Preset_ID { get; set; }

        /// <summary>
        /// Quantity in the main/base unit (Level 1 of the preset)
        /// </summary>
        [Required]
        public int Main_Unit_Quantity { get; set; }

        /// <summary>
        /// Pricing for each level in the preset hierarchy
        /// </summary>
        [Required]
        public List<UnitPresetPricingDto> LevelPricing { get; set; } = new List<UnitPresetPricingDto>();
    }

    /// <summary>
    /// Pricing for a specific unit level in the preset
    /// </summary>
    public class UnitPresetPricingDto
    {
        [Required]
        public int Level { get; set; } // 1, 2, 3, etc.

        [Required]
        public int UOM_ID { get; set; }

        [Required]
        public decimal Price_Per_Unit { get; set; }
    }
}
