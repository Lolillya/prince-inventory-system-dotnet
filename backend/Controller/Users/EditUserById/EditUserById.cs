using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos.Account;
using backend.Dtos.User;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

                // Build the response with related data
                var response = new EditUserResponseDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email ?? string.Empty,
                    PhoneNumber = user.PhoneNumber ?? string.Empty,
                    CompanyName = user.CompanyName,
                    Address = user.Address,
                    Notes = user.Notes,
                    RoleID = payload.RoleID,
                    Username = user.UserName ?? string.Empty
                };

                // For customers (RoleID = 4), include invoices
                if (payload.RoleID == 4)
                {
                    var invoices = await _db.Invoice
                        .Where(i => i.Customer_ID == userId)
                        .Select(i => new InvoiceSummaryDto
                        {
                            Invoice_ID = i.Invoice_ID,
                            Invoice_Number = i.Invoice_Number,
                            Notes = i.Notes,
                            CreatedAt = i.CreatedAt,
                            UpdatedAt = i.UpdatedAt,
                            Total_Amount = i.Total_Amount,
                            Discount = i.Discount,
                            Status = i.Status,
                            Term = i.Term
                        })
                        .ToListAsync();

                    response.Invoices = invoices;
                    Console.WriteLine($"Included {invoices.Count} invoices for customer");
                }
                // For suppliers (RoleID = 3), include restock batches
                else if (payload.RoleID == 3)
                {
                    var restockBatches = await _db.RestockBatches
                        .Include(rb => rb.Restock)
                        .Where(rb => rb.Supplier_ID == userId)
                        .Select(rb => new RestockBatchSummaryDto
                        {
                            Batch_ID = rb.Batch_ID,
                            Restock_ID = rb.Restock_ID,
                            Batch_Number = rb.Batch_Number,
                            CreatedAt = rb.CreatedAt,
                            UpdatedAt = rb.UpdatedAt,
                            Restock_Number = rb.Restock.Restock_Number,
                            Restock_Notes = rb.Restock.Restock_Notes
                        })
                        .ToListAsync();

                    response.RestockBatches = restockBatches;
                    Console.WriteLine($"Included {restockBatches.Count} restock batches for supplier");
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating user: {ex.Message}");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}