using System;
using System.Threading.Tasks;
using api.Dtos.Account;
using backend.Dtos.Account;
using backend.Interface;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers.Auth
{
    [Route("api/auth")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly UserManager<PersonalDetails> _userManager;
        private readonly ITokenService _tokenService;
        private readonly SignInManager<PersonalDetails> _signManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public LoginController(
            UserManager<PersonalDetails> userManager,
            ITokenService tokenService,
            SignInManager<PersonalDetails> signInManager,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signManager = signInManager;
            _roleManager = roleManager;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.UserName == loginDto.Username.ToLower());
            if (user == null) return Unauthorized("Invalid username!");

            var result = await _signManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!result.Succeeded) return Unauthorized("Username or Password not found.");

            var userRoles = await _userManager.GetRolesAsync(user);
            var role = await _roleManager.FindByNameAsync(userRoles.FirstOrDefault());

            return Ok(
                new NewUserDto
                {
                    Username = user.UserName,
                    Email = user.Email,
                    Token = _tokenService.CreateToken(user, userRoles),
                    CompanyName = user.CompanyName,
                    Notes = user.Notes,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    PhoneNumber = user.PhoneNumber,
                    Role = role != null ? role.NormalizedName : string.Empty,
                    User_ID = user.Id
                }
            );
        }
    }
}