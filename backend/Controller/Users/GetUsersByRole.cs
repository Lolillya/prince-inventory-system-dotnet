using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using backend.Models;
using backend.Dtos.User;

namespace backend.Controller.Suppliers
{
    [Route("api/users/")]
    [ApiController]
    public class GetAllSuppliers : ControllerBase
    {
        private readonly UserManager<PersonalDetails> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public GetAllSuppliers(UserManager<PersonalDetails> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string id)
        {
            try
            {
                // Get the supplier role by ID
                var supplierRole = await _roleManager.FindByIdAsync(id);
                if (supplierRole == null)
                    return NotFound("Role not found");

                // Get all users in the supplier role
                var supplierUsers = await _userManager.GetUsersInRoleAsync(supplierRole.Name);
                if (supplierUsers == null)
                    return NotFound("No Users Found!");

                // Map to DTO
                var suppliers = supplierUsers.Select(user => new UserDto
                {
                    Id = user.Id,
                    Username = user.UserName,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    CompanyName = user.CompanyName,
                    Notes = user.Notes,
                    PhoneNumber = user.PhoneNumber,
                    Role = supplierRole.Name,
                    Address = user.Address

                }).ToList();

                return Ok(suppliers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}