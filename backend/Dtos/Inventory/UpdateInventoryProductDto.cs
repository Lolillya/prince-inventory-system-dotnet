using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.Inventory
{
    public class UpdateInventoryProductDto
    {
        public string ProductName { get; set; } = "";
        public string Description { get; set; } = "";
        public string ProductCode { get; set; } = "";
        public string Inventory_Clerk { get; set; } = "";
        public int Brand_Id { get; set; }
        public int Category_Id { get; set; }
        public int Variant_Id { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}