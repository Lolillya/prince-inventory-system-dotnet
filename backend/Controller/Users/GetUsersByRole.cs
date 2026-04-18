using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using backend.Data;
using backend.Models;
using backend.Dtos.User;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.Suppliers
{
    [Route("api/users/")]
    [ApiController]
    public class GetAllSuppliers : ControllerBase
    {
        private readonly UserManager<PersonalDetails> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDBContext _db;

        public GetAllSuppliers(UserManager<PersonalDetails> userManager, RoleManager<IdentityRole> roleManager, ApplicationDBContext db)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string id)
        {
            try
            {
                // Get the role by ID
                var supplierRole = await _roleManager.FindByIdAsync(id);
                if (supplierRole == null)
                    return NotFound("Role not found");

                // Get all users in the role
                var supplierUsers = await _userManager.GetUsersInRoleAsync(supplierRole.Name);
                if (supplierUsers == null)
                    return NotFound("No Users Found!");

                var userIds = supplierUsers.Select(u => u.Id).ToList();

                // Fetch customer terms for these users (only customers will have records)
                var termsByUserId = await _db.CustomerTerms
                    .Where(ct => userIds.Contains(ct.User_ID))
                    .ToDictionaryAsync(ct => ct.User_ID, ct => (int?)ct.Term);

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
                    Address = user.Address,
                    Term = termsByUserId.TryGetValue(user.Id, out var term) ? term : null
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