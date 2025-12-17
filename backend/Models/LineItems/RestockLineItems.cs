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
        public int Restock_ID { get; set; } // foreign key from Restock
        public int Uom_ID { get; set; } // foreign key from UnitOfMeasure
        public Product Product { get; set; } = null!; // Product table navigation property
        public Restock Restock { get; set; } = null!; // Restock table navigation property
        public UnitOfMeasure UnitOfMeasure { get; set; } = null!; // UnitOfMeasure table navigation property

        [Column(TypeName = "decimal(18,2)")] // specify precision and scale
        public decimal Unit_Price { get; set; } // unit price of the product
        public int Unit_Quantity { get; set; } // unit quantity of the product
    }
}