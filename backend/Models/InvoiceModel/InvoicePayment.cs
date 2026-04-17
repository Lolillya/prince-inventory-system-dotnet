using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.InvoiceModel
{
    public class InvoicePayment
    {
        [Key]
        public int Payment_ID { get; set; }

        public int Invoice_ID { get; set; }

        [ForeignKey(nameof(Invoice_ID))]
        public Invoice Invoice { get; set; } = null!;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public string PaymentMethod { get; set; } = null!;

        public string? ReferenceNo { get; set; }

        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = null!;

        [ForeignKey(nameof(CreatedBy))]
        public PersonalDetails Creator { get; set; } = null!;

        public bool IsInvalidated { get; set; } = false;

        public DateTime? InvalidatedAt { get; set; }

        public string? InvalidatedBy { get; set; }

        [ForeignKey(nameof(InvalidatedBy))]
        public PersonalDetails? Invalidator { get; set; }

        public string? InvalidationReason { get; set; }
    }
}
