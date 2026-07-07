using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.Account
{
    public class EditUserDto
    {
        public string? Address { get; set; }
        [Required]
        public string CompanyName { get; set; }
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        [Required]
        public string Id { get; set; }
        public string? LastName { get; set; }
        public string? Notes { get; set; }
        public string? PhoneNumber { get; set; }
        [Required]
        public int RoleID { get; set; }
        [Required]
        public string Username { get; set; }
        public int? Term { get; set; }
        public string? Password { get; set; }

    }
}