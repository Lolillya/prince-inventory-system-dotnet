using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using backend.Models.Inventory;
using backend.Models.RestockModel;
using backend.Models.Unit;

namespace backend.Models.LineItems
{
    public class RestockLineItems
    {
        [Key]
        public int LineItem_ID { get; set; } // primary key

        // FKs
        public int Product_ID { get; set; } // foreign key from Product
        public int Batch_ID { get; set; } // foreign key from RestockBatch
        public int Base_UOM_ID { get; set; } // foreign key from UnitOfMeasure (base unit, e.g., BOX)
        public int? Preset_ID { get; set; } // foreign key from Unit_Preset (nullable for backwards compatibility)

        public Product Product { get; set; } = null!; // Product table navigation property
        public RestockBatch RestockBatch { get; set; } = null!; // RestockBatch table navigation property
        public UnitOfMeasure BaseUnitOfMeasure { get; set; } = null!; // UnitOfMeasure table navigation property
        public Unit_Preset? UnitPreset { get; set; } // Unit_Preset table navigation property (nullable)

        [Column(TypeName = "decimal(18,2)")] // specify precision and scale
        public decimal Base_Unit_Price { get; set; } // price per base unit (e.g., 1000.00 per BOX)
        public int Base_Unit_Quantity { get; set; } // quantity of base units (e.g., 500 boxes)

        // Navigation properties
        public ICollection<Product_UOM> ProductUOMs { get; set; } = new List<Product_UOM>(); // unit conversions for this line item
        public ICollection<RestockLineItem_PresetPricing> PresetPricing { get; set; } = new List<RestockLineItem_PresetPricing>(); // pricing for each preset level
    }
}