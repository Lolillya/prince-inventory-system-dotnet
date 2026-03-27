using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.PurchaseOrder
{
    public class PurchaseOrderCreateDto
    {
        [Required]
        public string Supplier_ID { get; set; } = null!;

        [Required]
        public string Purchase_Order_Clerk { get; set; } = null!;

        [Required]
        public DateTime Preferred_Delivery { get; set; }

        public string Notes { get; set; } = string.Empty;

        [Required]
        public List<PurchaseOrderCreateLineItemDto> LineItems { get; set; } = new List<PurchaseOrderCreateLineItemDto>();
    }

    public class PurchaseOrderCreateLineItemDto
    {
        [Required]
        public int Product_ID { get; set; }

        public int? Preset_ID { get; set; }

        [Required]
        public int UOM_ID { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public decimal Unit_Price { get; set; }
    }
}
