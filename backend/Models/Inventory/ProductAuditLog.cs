using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Unit;

namespace backend.Models.Inventory
{
    public class ProductAuditLog
    {
        [Key]
        public int AuditLog_ID { get; set; }

        public int Product_ID { get; set; }

        public int? Product_Preset_ID { get; set; }

        public string UserId { get; set; } = string.Empty;

        // Snapshot of username at time of change — preserved even if user is deleted
        public string UserName { get; set; } = string.Empty;

        // PRESET_ASSIGNED | PRICING_UPDATED | STOCK_THRESHOLD_UPDATED | PRODUCT_EDITED
        public string Action { get; set; } = string.Empty;

        // e.g. "BOX", "Low_Stock_Level", "Product_Name", "Category"
        public string? FieldName { get; set; }

        public string? OldValue { get; set; }

        public string? NewValue { get; set; }

        // Human-readable summary shown in UI
        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("Product_ID")]
        public Product Product { get; set; } = null!;

        [ForeignKey("Product_Preset_ID")]
        public Product_Unit_Preset? ProductPreset { get; set; }
    }
}
