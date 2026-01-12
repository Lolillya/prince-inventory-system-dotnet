using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using backend.Models.Unit;
using backend.Models.LineItems;

namespace backend.Models.Inventory
{
    public class Product
    {
        [Key]
        public int Product_ID { get; set; }
        public string Product_Code { get; set; } = null!;
        public string Product_Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int Brand_ID { get; set; }
        public int Category_ID { get; set; }
        public int Variant_ID { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public Brand Brand { get; set; } = null!;
        public Category Category { get; set; } = null!;
        public Variant Variant { get; set; } = null!;
        public ICollection<Product_Unit_Preset> ProductPresets { get; set; } = new List<Product_Unit_Preset>();
        public ICollection<RestockLineItems> RestockLineItems { get; set; } = new List<RestockLineItems>();

    }
}