using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.Account
{
    public class RegisterDto
    {
        [Required]
        public string? Username { get; set; }
        [EmailAddress]
        public string? Email { get; set; }
        [Required]
        public string? Password { get; set; }

        // ADDITIONAL REQUIRED DETAILS
        [Required]
        public string CompanyName { get; set; } = "";
        public string Notes { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        [Required]
        public string RoleId { get; set; } = "";
        public string Address { get; set; } = "";
        public int? Term { get; set; }
    }
}