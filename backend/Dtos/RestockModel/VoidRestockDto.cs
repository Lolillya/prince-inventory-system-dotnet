using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.RestockModel
{
    public class VoidRestockDto
    {
        [Required]
        public string Reason { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
