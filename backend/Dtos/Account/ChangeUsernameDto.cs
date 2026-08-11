using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Account
{
    public class ChangeUsernameDto
    {
        [Required]
        public string UserId { get; set; }
        [Required]
        public string NewUsername { get; set; }
    }
}
