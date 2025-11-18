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
        public string Product_Code { get; set; }
        public string Product_Name { get; set; }
        public string Description { get; set; }
        public int Brand_ID { get; set; }
        public int Category_ID { get; set; }
        public int Variant_ID { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

    }
}