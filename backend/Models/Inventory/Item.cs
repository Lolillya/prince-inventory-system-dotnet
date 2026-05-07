using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.Inventory
{
    public class Item
    {
        [Key]
        public int Item_ID { get; set; }
        public string ItemName { get; set; } = null!;
        public string? Item_Code { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
