using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.InvoiceDTO
{
    public class RecordPaymentDto
    {
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
        public decimal Amount { get; set; }

        [Required]
        public string PaymentMethod { get; set; } = null!;

        public string? ReferenceNo { get; set; }
    }
}
