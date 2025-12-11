using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.Account
{
    public class EditUserDto
    {
        [Required]
        public string Address { get; set; }
        [Required]
        public string CompanyName { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string Id { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        public string Notes { get; set; }
        [Required]
        public string PhoneNumber { get; set; }
        [Required]
        public int RoleID { get; set; }
        [Required]
        public string Username { get; set; }

    }
}