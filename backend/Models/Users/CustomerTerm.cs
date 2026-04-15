using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Users
{
    public class CustomerTerm
    {
        [Key]
        public int CustomerTerm_ID { get; set; }

        [Required]
        public string User_ID { get; set; } = null!;

        [Required]
        public int Term { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(User_ID))]
        public PersonalDetails User { get; set; } = null!;
    }
}
