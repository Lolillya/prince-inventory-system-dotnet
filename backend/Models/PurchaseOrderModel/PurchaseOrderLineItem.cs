using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Inventory;
using backend.Models.Unit;

namespace backend.Models.PurchaseOrderModel
{
    public class PurchaseOrderLineItem
    {
        [Key]
        public int Purchase_Order_LineItem_ID { get; set; }

        public int Purchase_Order_ID { get; set; }
        public int Product_ID { get; set; }
        public int? Preset_ID { get; set; }
        public int UOM_ID { get; set; }
        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Unit_Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Sub_Total { get; set; }

        public PurchaseOrder PurchaseOrder { get; set; } = null!;
        public Product Product { get; set; } = null!;
        public Unit_Preset? UnitPreset { get; set; }
        public UnitOfMeasure UnitOfMeasure { get; set; } = null!;
    }
}
