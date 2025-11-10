

using System.ComponentModel.DataAnnotations;

namespace backend.Models.Unit
{
    public class UnitOfMeasure
    {
        [Key]
        public int uom_ID { get; set; }
        public string uom_Name { get; set; } = null!;
    }
}

