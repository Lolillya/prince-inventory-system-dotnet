using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Unit
{
    /// <summary>
    /// Stores default pricing information for each unit level in a preset for a product.
    /// This table holds the pricing that will be used when assigning a product to a preset,
    /// similar to RestockLineItem_PresetPricing but tied to Product_Unit_Preset instead of LineItem.
    /// </summary>
    public class Product_Unit_Preset_Pricing
    {
        [Key]
        public int Pricing_ID { get; set; }

        public int Product_Preset_ID { get; set; } // FK to Product_Unit_Preset

        public int Level { get; set; } // Level in the preset hierarchy (1, 2, 3, etc.)

        public int UOM_ID { get; set; } // FK to UnitOfMeasure

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price_Per_Unit { get; set; } // Default price for this specific unit level

        public DateTime Created_At { get; set; } = DateTime.UtcNow;

        public DateTime Updated_At { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("Product_Preset_ID")]
        public Product_Unit_Preset ProductUnitPreset { get; set; } = null!;

        [ForeignKey("UOM_ID")]
        public UnitOfMeasure UnitOfMeasure { get; set; } = null!;
    }
}
