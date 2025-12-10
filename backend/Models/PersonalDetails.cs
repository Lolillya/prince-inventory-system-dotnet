using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace backend.Models
{
    public class PersonalDetails : IdentityUser
    {
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string CompanyName { get; set; } = "";
        public string Notes { get; set; } = "";
        public string Address { get; set; } = "";
    }
}