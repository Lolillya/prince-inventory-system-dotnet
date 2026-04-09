using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.PurchaseOrder
{
    public class PurchaseOrderUpdateStatusDto
    {
        [Required]
        public string Status { get; set; } = null!;
    }
}
