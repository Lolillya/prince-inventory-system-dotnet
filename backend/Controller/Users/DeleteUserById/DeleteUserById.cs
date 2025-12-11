using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos.User;
using backend.Models.Users;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Users.DeleteUsersById
{
    [ApiController]
    [Route("api/delete-user-by-id")]
    public class DeleteUserById : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public DeleteUserById(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPut]
        public async Task<IActionResult> DeleteUser([FromBody] DeleteUserDto payload)
        {
            try
            {
                await using var transaction = await _db.Database.BeginTransactionAsync();

                var user = await _db.Users.FindAsync(payload.UserId);
                if (user == null)
                    return NotFound($"User with id {payload.UserId} not found");

                // Create a new DeletedUsers entry with the user's data
                var deletedUser = new DeletedUsers
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    CompanyName = user.CompanyName,
                    Notes = user.Notes,
                    Address = user.Address
                };

                // Add to DeletedUsers table
                await _db.DeletedUsers.AddAsync(deletedUser);

                // Remove from Users table
                _db.Users.Remove(user);

                // Save changes
                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                Console.WriteLine($"User {payload.UserId} moved to DeletedUsers table successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting user: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }


            return Ok(new { message = "User deleted successfully" });
        }
    }
}