
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Inventory;
using backend.Models.LineItems;
using backend.Models.RestockModel;

namespace backend.Models.Unit
{
    public class Product_UOM
    {
        [Key]
        public int Product_UOM_Id { get; set; } // primary key

        // FKs
        public int LineItem_ID { get; set; } // foreign key from RestockLineItems
        public int UOM_ID { get; set; } // foreign key from UnitOfMeasure (current unit, e.g., CASE or PIECES)
        public int? Parent_UOM_ID { get; set; } // foreign key from UnitOfMeasure (parent unit, e.g., BOX is parent of CASE)

        public RestockLineItems RestockLineItem { get; set; } = null!; // RestockLineItems navigation property
        public UnitOfMeasure UnitOfMeasure { get; set; } = null!; // Current UnitOfMeasure navigation property
        public UnitOfMeasure? ParentUnitOfMeasure { get; set; } // Parent UnitOfMeasure navigation property

        public int Conversion_Factor { get; set; } // conversion factor (e.g., 10 CASE per 1 BOX)

        [Column(TypeName = "decimal(18,2)")]
        public decimal Unit_Price { get; set; } // price per this unit (e.g., 50.00 per CASE)
    }
}