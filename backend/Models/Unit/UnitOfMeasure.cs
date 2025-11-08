using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models.Unit
{
    public class UnitOfMeasure
    {
        public int uom_ID { get; set; }
        public string uom_Name { get; set; } = null!;
    }
}