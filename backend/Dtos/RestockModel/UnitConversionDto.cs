using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.RestockModel
{
    public class UnitConversionDto
    {
        [Required]
        public string FromUnit { get; set; } = null!;

        [Required]
        public string ToUnit { get; set; } = null!;

        [Required]
        public int ConversionFactor { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public decimal Price { get; set; }
    }
}