using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.InvoiceDTO
{
    public class VoidInvoiceDto
    {
        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Reason { get; set; } = string.Empty;
    }
}
