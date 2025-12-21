using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.InvoiceModel
{
    public class Invoice
    {
        [Key]
        public int Invoice_ID { get; set; }
        public int Invoice_Number { get; set; }
        public string? Notes { get; set; }

        // FKs
        public string Customer_ID { get; set; } = null!;
        public string Invoice_Clerk { get; set; } = null!;


        [ForeignKey(nameof(Customer_ID))]
        public PersonalDetails Customer { get; set; } = null!;
        [ForeignKey(nameof(Invoice_Clerk))]
        public PersonalDetails Clerk { get; set; } = null!;


        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total_Amount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Discount { get; set; }
        public string? Status { get; set; }
        public int Term { get; set; }

        [InverseProperty("Invoices")]
        public ICollection<LineItems.InvoiceLineItems> LineItems { get; set; } = new List<LineItems.InvoiceLineItems>();
    }
}