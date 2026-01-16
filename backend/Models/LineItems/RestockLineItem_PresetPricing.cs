using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Unit;

namespace backend.Models.LineItems
{
    /// <summary>
    /// Stores pricing information for each unit level in a preset for a restock line item
    /// </summary>
    public class RestockLineItem_PresetPricing
    {
        [Key]
        public int Pricing_ID { get; set; }

        public int LineItem_ID { get; set; } // FK to RestockLineItems

        public int Level { get; set; } // Level in the preset hierarchy (1, 2, 3, etc.)

        public int UOM_ID { get; set; } // FK to UnitOfMeasure

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price_Per_Unit { get; set; } // Price for this specific unit level

        public DateTime Created_At { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("LineItem_ID")]
        public RestockLineItems RestockLineItem { get; set; } = null!;

        [ForeignKey("UOM_ID")]
        public UnitOfMeasure UnitOfMeasure { get; set; } = null!;
    }
}
