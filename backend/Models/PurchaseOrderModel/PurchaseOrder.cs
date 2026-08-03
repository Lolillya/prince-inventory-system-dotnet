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
        public string Status { get; set; } = "NOT_DELIVERED";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Set when the purchase order is cancelled
        public string? Cancelled_By { get; set; } // foreign key from PersonalDetails
        public PersonalDetails? CancelledByUser { get; set; }
        public DateTime? Cancelled_At { get; set; }
        public string? Cancellation_Reason { get; set; }

        public PersonalDetails Supplier { get; set; } = null!;
        public PersonalDetails Clerk { get; set; } = null!;
        public ICollection<PurchaseOrderLineItem> LineItems { get; set; } = new List<PurchaseOrderLineItem>();
    }
}
