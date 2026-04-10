using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Inventory;
using backend.Models.Unit;

namespace backend.Models.Suppliers
{
    /// <summary>
    /// Stores the purchase price a specific supplier charges Prince per product+preset combination
    /// </summary>
    public class Supplier_Product_Preset_Price
    {
        [Key]
        public int Price_ID { get; set; }

        public string Supplier_ID { get; set; } = null!; // FK to AspNetUsers (PersonalDetails)

        public int Product_ID { get; set; } // FK to Products

        public int Preset_ID { get; set; } // FK to Unit_Presets

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price_Per_Unit { get; set; } // Supplier's price for the preset main unit

        public DateTime Created_At { get; set; } = DateTime.UtcNow;

        public DateTime Updated_At { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("Supplier_ID")]
        public PersonalDetails Supplier { get; set; } = null!;

        [ForeignKey("Product_ID")]
        public Product Product { get; set; } = null!;

        [ForeignKey("Preset_ID")]
        public Unit_Preset Preset { get; set; } = null!;
    }
}
