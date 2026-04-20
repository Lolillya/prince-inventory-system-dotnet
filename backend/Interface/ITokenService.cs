using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Interface
{
    public interface ITokenService
    {
        string CreateToken(PersonalDetails user, IList<string> roles);
    }
}