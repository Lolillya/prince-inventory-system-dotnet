using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using backend.Models.Inventory;

namespace backend.Models.Users
{
    public class UserInventoryFavorites
    {
        [Key]
        public int Favorite_ID { get; set; }

        [Required]
        public string User_ID { get; set; } = null!;

        [Required]
        public int Product_ID { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public PersonalDetails User { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}