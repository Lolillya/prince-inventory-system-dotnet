
using System.ComponentModel.DataAnnotations;
using backend.Models.Inventory;
using backend.Models.RestockModel;

namespace backend.Models.Unit
{
    public class Product_UOM
    {
        [Key]
        public int Product_UOM_Id { get; set; }

        public int Conversion_Factor { get; set; }
        public decimal Price { get; set; }

        // FKs
        public int Parent_UOM_Id { get; set; }
        public int Batch_Id { get; set; }
        public int Product_Id { get; set; }
        public int UOM_Id { get; set; }

        public RestockBatch RestockBatch { get; set; } = null!;
        public UnitOfMeasure UnitOfMeasure { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}