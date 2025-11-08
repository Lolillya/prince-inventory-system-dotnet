
using System.ComponentModel.DataAnnotations;
using backend.Models.Inventory;

namespace backend.Models.Unit
{
    public class Product_UOM
    {
        [Key]
        public int Product_UOM_Id { get; set; }

        public int Conversion_Factor { get; set; }

        // FKs
        public int Parent_UOM_Id { get; set; }
        public int Product_Id { get; set; }
        public int UOM_Id { get; set; }

        public UnitOfMeasure UnitOfMeasure { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}