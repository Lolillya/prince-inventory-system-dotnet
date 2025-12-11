using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos.Account;
using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Users.EditUserById
{
    [ApiController]
    [Route("api/edit-user-by-id")]
    public class EditUserById : ControllerBase
    {

        private readonly ApplicationDBContext _db;

        public EditUserById(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPut]
        public async Task<IActionResult> EditUser([FromBody] EditUserDto payload)
        {
            Console.WriteLine("=== EditUser Endpoint Hit ===");
            Console.WriteLine($"Id: {payload.Id}");
            Console.WriteLine($"FirstName: {payload.FirstName}");
            Console.WriteLine($"LastName: {payload.LastName}");
            Console.WriteLine($"Email: {payload.Email}");
            Console.WriteLine($"PhoneNumber: {payload.PhoneNumber}");
            Console.WriteLine($"CompanyName: {payload.CompanyName}");
            Console.WriteLine($"Address: {payload.Address}");
            Console.WriteLine($"Notes: {payload.Notes}");
            Console.WriteLine($"RoleID: {payload.RoleID}");
            Console.WriteLine($"Username: {payload.Username}");

            try
            {
                await using var transaction = await _db.Database.BeginTransactionAsync();
                var userId = payload.Id;
                var user = await _db.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound($"User with id {userId} not found");
                }

                // Update the existing user entity
                user.Address = payload.Address;
                user.CompanyName = payload.CompanyName;
                user.Email = payload.Email;
                user.FirstName = payload.FirstName;
                user.LastName = payload.LastName;
                user.Notes = payload.Notes;
                user.PhoneNumber = payload.PhoneNumber;

                _db.Users.Update(user);
                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                Console.WriteLine("User updated successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating user: {ex.Message}");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }

            return Ok();
        }
    }
}