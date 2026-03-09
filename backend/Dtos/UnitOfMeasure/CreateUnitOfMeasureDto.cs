using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.UnitOfMeasure
{
    public class CreateUnitOfMeasureDto
    {
        [Required(ErrorMessage = "Unit name is required")]
        [StringLength(50, MinimumLength = 1, ErrorMessage = "Unit name must be between 1 and 50 characters")]
        public string Uom_Name { get; set; } = null!;
    }

    public class CreateUnitOfMeasureResponseDto
    {
        public int Uom_ID { get; set; }
        public string Uom_Name { get; set; } = null!;
        public string Message { get; set; } = null!;
    }
}
