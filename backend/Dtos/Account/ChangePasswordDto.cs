using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Account
{
    public class ChangePasswordDto
    {
        [Required]
        public string UserId { get; set; }
        [Required]
        public string NewPassword { get; set; }
    }
}
