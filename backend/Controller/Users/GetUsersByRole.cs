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
        public async Task<IActionResult> GetAll([FromQuery] string[] id)
        {
            try
            {
                if (id == null || id.Length == 0)
                    return BadRequest("At least one role ID is required");

                var allUsers = new List<UserDto>();

                foreach (var roleId in id)
                {
                    var role = await _roleManager.FindByIdAsync(roleId);
                    if (role == null) continue;

                    var usersInRole = await _userManager.GetUsersInRoleAsync(role.Name);
                    if (usersInRole == null) continue;

                    var userIds = usersInRole.Select(u => u.Id).ToList();

                    var termsByUserId = await _db.CustomerTerms
                        .Where(ct => userIds.Contains(ct.User_ID))
                        .ToDictionaryAsync(ct => ct.User_ID, ct => (int?)ct.Term);

                    var mapped = usersInRole.Select(user => new UserDto
                    {
                        Id = user.Id,
                        Username = user.UserName,
                        Email = user.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        CompanyName = user.CompanyName,
                        Notes = user.Notes,
                        PhoneNumber = user.PhoneNumber,
                        Role = role.Name,
                        Address = user.Address,
                        Term = termsByUserId.TryGetValue(user.Id, out var term) ? term : null
                    });

                    allUsers.AddRange(mapped);
                }

                return Ok(allUsers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}