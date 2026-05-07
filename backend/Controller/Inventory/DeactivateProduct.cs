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
    [Route("api/inventory/{productId:int}/deactivate")]
    public class DeactivateProduct : ControllerBase
    {
        private readonly ApplicationDBContext _db;
        private readonly UserManager<PersonalDetails> _userManager;

        public DeactivateProduct(ApplicationDBContext db, UserManager<PersonalDetails> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        [HttpPatch]
        public async Task<IActionResult> Deactivate(int productId, [FromBody] ProductActionDto request)
        {
            var product = await _db.Products.FindAsync(productId);
            if (product == null) return NotFound("Product not found.");

            if (!product.Is_Active)
                return BadRequest("Product is already deactivated.");

            // Must have 0 packaging presets
            var hasPresets = _db.Product_Unit_Presets.Any(pup => pup.Product_ID == productId);
            if (hasPresets)
                return BadRequest("Cannot deactivate a product with packaging presets assigned. Remove all presets first.");

            // Verify password
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null) return Unauthorized();

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!isPasswordValid) return Unauthorized("Incorrect password.");

            product.Is_Active = false;
            product.UpdatedAt = DateTime.Now;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Product deactivated successfully." });
        }
    }
}
