using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models.Unit
{
    public class Product_UOM
    {
        public int Product_UOM_Id { get; set; }
        public int Product_Id { get; set; }
        public int UOM_Id { get; set; }
        public int Conversion_Factor { get; set; }
        public int Parent_UOM_Id { get; set; }
    }
}