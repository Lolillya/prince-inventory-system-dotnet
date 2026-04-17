using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.InvoiceDTO
{
    public class InvalidatePaymentDto
    {
        [Required]
        public string Password { get; set; } = null!;

        [Required]
        public string Reason { get; set; } = null!;
    }
}
