using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.PurchaseOrder
{
    public class PurchaseOrderUpdateStatusDto
    {
        [Required]
        public string Status { get; set; } = null!;

        // Required when Status == "CANCELLED"
        public string? Reason { get; set; }

        // Required when Status == "CANCELLED" - verifies the acting user's password
        public string? Password { get; set; }
    }
}
