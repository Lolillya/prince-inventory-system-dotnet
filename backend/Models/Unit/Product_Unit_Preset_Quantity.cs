using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Unit
{
    /// <summary>
    /// Stores quantity information for each unit level in a preset for a product.
    /// Tracks both original quantity and remaining quantity for inventory breakdown.
    /// </summary>
    public class Product_Unit_Preset_Quantity
    {
        [Key]
        public int Quantity_ID { get; set; }

        public int Product_Preset_ID { get; set; } // FK to Product_Unit_Preset

        public int Level { get; set; } // Level in the preset hierarchy (1, 2, 3, etc.)

        public int UOM_ID { get; set; } // FK to UnitOfMeasure

        public int Original_Quantity { get; set; } // Original quantity for this unit level (e.g., 100 Boxes)

        public int Remaining_Quantity { get; set; } // Remaining quantity for this unit level (e.g., 85 Boxes)

        public DateTime Created_At { get; set; } = DateTime.UtcNow;

        public DateTime Updated_At { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("Product_Preset_ID")]
        public Product_Unit_Preset ProductUnitPreset { get; set; } = null!;

        [ForeignKey("UOM_ID")]
        public UnitOfMeasure UnitOfMeasure { get; set; } = null!;
    }
}
