using System.ComponentModel.DataAnnotations;
using backend.Dtos.Inventory;

namespace backend.Dtos.RestockModel
{
    public class RestockLineItemPayloadDto
    {
        [Required]
        public ItemDetailDto item { get; set; } = null!;

        public decimal total { get; set; }

        public int uom_ID { get; set; }

        public decimal unit_price { get; set; }

        public int unit_quantity { get; set; }

        public List<UnitConversionDto>? unitConversions { get; set; }
    }

    public class ItemDetailDto
    {
        public Brand brand { get; set; } = null!;
        public Product product { get; set; } = null!;
        public Variant variant { get; set; } = null!;
    }
}
