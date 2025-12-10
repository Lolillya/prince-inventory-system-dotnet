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
    public class RegisterController : ControllerBase
    {
        private readonly UserManager<PersonalDetails> _userManager;
        private readonly ITokenService _tokenService;
        private readonly RoleManager<IdentityRole> _roleManager;

        public RegisterController(UserManager<PersonalDetails> userManager, ITokenService tokenService, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _roleManager = roleManager;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var role = await _roleManager.FindByIdAsync(registerDto.RoleId);
                if (role == null)
                    return BadRequest("Invalid role ID");

                var appUser = new PersonalDetails
                {
                    UserName = registerDto.Username,
                    Email = registerDto.Email,
                    CompanyName = registerDto.CompanyName,
                    Notes = registerDto.Notes,
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    PhoneNumber = registerDto.PhoneNumber,
                    Address = registerDto.Address
                };

                var createdUser = await _userManager.CreateAsync(appUser, registerDto.Password);

                if (createdUser.Succeeded)
                {
                    if (string.IsNullOrEmpty(role.Name))
                        return BadRequest("Invalid role name");

                    var roleResult = await _userManager.AddToRoleAsync(appUser, role.Name);
                    if (roleResult.Succeeded)
                        return Ok(
                            new NewUserDto
                            {
                                Username = appUser.UserName,
                                Email = appUser.Email,
                                Token = _tokenService.CreateToken(appUser),
                                CompanyName = appUser.CompanyName,
                                Notes = appUser.Notes,
                                FirstName = appUser.FirstName,
                                LastName = appUser.LastName,
                                PhoneNumber = appUser.PhoneNumber,
                                Role = role.NormalizedName,
                                User_ID = appUser.Id
                            }
                        );
                    else
                        return StatusCode(500, roleResult.Errors);
                }
                else
                    return StatusCode(500, createdUser.Errors);
            }
            catch (Exception e)
            {
                return StatusCode(500, e);
            }
        }
    }
}