using backend.Data;
using backend.Dtos.Inventory;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controller.Inventory
{
    [ApiController]
    [Authorize]
    [Route("api/inventory/{productId:int}/reactivate")]
    public class ReactivateProduct : ControllerBase
    {
        private readonly ApplicationDBContext _db;
        private readonly UserManager<PersonalDetails> _userManager;

        public ReactivateProduct(ApplicationDBContext db, UserManager<PersonalDetails> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        [HttpPatch]
        public async Task<IActionResult> Reactivate(int productId, [FromBody] ProductActionDto request)
        {
            var product = await _db.Products.FindAsync(productId);
            if (product == null) return NotFound("Product not found.");

            if (product.Is_Active)
                return BadRequest("Product is already active.");

            // Verify password
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null) return Unauthorized();

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!isPasswordValid) return Unauthorized("Incorrect password.");

            product.Is_Active = true;
            product.UpdatedAt = DateTime.Now;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Product reactivated successfully." });
        }
    }
}
