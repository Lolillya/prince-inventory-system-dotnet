using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.Inventory
{
    public class Product
    {
        [Key]
        public int Product_ID { get; set; }
        public string Product_Code { get; set; } = null!;
        public string Product_Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // FKs
        public int Brand_ID { get; set; }
        public int Category_ID { get; set; }
        public int Variant_ID { get; set; }

        public Brand Brand { get; set; } = null!;
        public Category Category { get; set; } = null!;
        public Variant Variant { get; set; } = null!;

    }
}