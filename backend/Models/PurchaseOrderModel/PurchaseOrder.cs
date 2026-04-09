using System.ComponentModel.DataAnnotations;
using backend.Models.LineItems;

namespace backend.Models.PurchaseOrderModel
{
    public class PurchaseOrder
    {
        [Key]
        public int Purchase_Order_ID { get; set; }

        public string Purchase_Order_Number { get; set; } = null!;
        public string Supplier_ID { get; set; } = null!;
        public string Purchase_Order_Clerk { get; set; } = null!;
        public DateTime Preferred_Delivery { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string Status { get; set; } = "PENDING";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public PersonalDetails Supplier { get; set; } = null!;
        public PersonalDetails Clerk { get; set; } = null!;
        public ICollection<PurchaseOrderLineItem> LineItems { get; set; } = new List<PurchaseOrderLineItem>();
    }
}
