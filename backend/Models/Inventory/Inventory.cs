using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.Inventory
{
    public class Inventory
    {
        [Key]
        public int Inventory_ID { get; set; }
        public int Product_ID { get; set; }
        public int Total_Quantity { get; set; }
        public int Inventory_Number { get; set; }
        public DateTime Created_At { get; set; }
        public DateTime Updated_At { get; set; }
        public string Inventory_Clerk { get; set; } = "";

        public Product Product { get; set; } = null!;
    }
}