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
        public int LineItem_ID { get; set; }

        // FKs
        public int Product_ID { get; set; }
        public int Restock_ID { get; set; }
        [ForeignKey(nameof(Product_ID))]
        public Product Product { get; set; } = null!;
        public Restock Restock { get; set; } = null!;

        public int uom_ID { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal Unit_Price { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal Sub_Total { get; set; }
        public int Quantity { get; set; }

        public UnitOfMeasure UnitOfMeasure { get; set; } = null!;
    }
}