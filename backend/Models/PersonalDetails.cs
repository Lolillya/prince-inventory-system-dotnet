using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using backend.Models.Users;

namespace backend.Models
{
    public class PersonalDetails : IdentityUser
    {
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string CompanyName { get; set; } = "";
        public string Notes { get; set; } = "";
        public string Address { get; set; } = "";

        // Navigation property for favorites
        public ICollection<UserInventoryFavorites> FavoriteInventoryItems { get; set; } = new List<UserInventoryFavorites>();
    }
}