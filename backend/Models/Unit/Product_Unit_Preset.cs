using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Inventory;

namespace backend.Models.Unit
{
    public class Product_Unit_Preset
    {
        [Key]
        public int Product_Preset_ID { get; set; }

        public int Product_ID { get; set; } // FK to Product

        public int Preset_ID { get; set; } // FK to Unit_Preset

        public int? Low_Stock_Level { get; set; } // Quantity in base unit for low stock indicator (e.g., 100 boxes)

        public int? Very_Low_Stock_Level { get; set; } // Quantity in base unit for very low stock indicator (e.g., 20 boxes)

        public DateTime Assigned_At { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("Product_ID")]
        public Product Product { get; set; } = null!;

        [ForeignKey("Preset_ID")]
        public Unit_Preset Preset { get; set; } = null!;

        public ICollection<Product_Unit_Preset_Pricing> PresetPricing { get; set; } = new List<Product_Unit_Preset_Pricing>();
    }
}
