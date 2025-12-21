using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Inventory;
using backend.Models.InvoiceModel;
using backend.Models.Unit;

namespace backend.Models.LineItems
{
    public class InvoiceLineItems
    {
        [Key]
        public int LineItem_ID { get; set; }

        // FKs
        public int Product_ID { get; set; }
        public int Invoice_ID { get; set; }
        [ForeignKey(nameof(Product_ID))]
        public Product Product { get; set; } = null!;
        [ForeignKey(nameof(Invoice_ID))]
        public Invoice Invoices { get; set; } = null!;
        public int UOM_ID { get; set; }
        [ForeignKey(nameof(UOM_ID))]
        public UnitOfMeasure UnitOfMeasure { get; set; } = null!;

        public string Unit { get; set; } = null!;
        [Column(TypeName = "decimal(18,2)")]
        public decimal Unit_Price { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal Sub_Total { get; set; }
        public int Unit_Quantity { get; set; }
        public int Discount { get; set; }
        public bool isPercentageDiscount { get; set; }
    }
}