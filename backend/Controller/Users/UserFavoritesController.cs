using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Models.Users;
using backend.Data;
using backend.Dtos.User;
using System.Security.Claims;

namespace backend.Controller.Users
{
    [Route("api/user-favorites")]
    [ApiController]
    [Authorize]
    public class UserFavoritesController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        private readonly UserManager<PersonalDetails> _userManager;

        public UserFavoritesController(ApplicationDBContext context, UserManager<PersonalDetails> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/user-favorites
        [HttpGet]
        public async Task<IActionResult> GetUserFavorites()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                var favorites = await _context.UserInventoryFavorites
                    .Where(f => f.User_ID == userId)
                    .Include(f => f.Product)
                        .ThenInclude(p => p.Brand)
                    .Include(f => f.Product)
                        .ThenInclude(p => p.Category)
                    .Include(f => f.Product)
                        .ThenInclude(p => p.Variant)
                    .OrderByDescending(f => f.CreatedAt)
                    .Select(f => new UserFavoriteDto
                    {
                        Favorite_ID = f.Favorite_ID,
                        Product_ID = f.Product_ID,
                        Product_Code = f.Product.Product_Code,
                        Product_Name = f.Product.Product_Name,
                        Description = f.Product.Description,
                        Brand_Name = f.Product.Brand.BrandName,
                        Category_Name = f.Product.Category.Category_Name,
                        Variant_Name = f.Product.Variant.Variant_Name,
                        CreatedAt = f.CreatedAt
                    })
                    .ToListAsync();

                return Ok(favorites);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/user-favorites
        [HttpPost]
        public async Task<IActionResult> AddFavorite([FromBody] AddFavoriteDto dto)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                // Check if product exists
                var productExists = await _context.Products.AnyAsync(p => p.Product_ID == dto.Product_ID);
                if (!productExists)
                    return NotFound("Product not found");

                // Check if already favorited
                var existingFavorite = await _context.UserInventoryFavorites
                    .FirstOrDefaultAsync(f => f.User_ID == userId && f.Product_ID == dto.Product_ID);

                if (existingFavorite != null)
                    return BadRequest("Product is already in favorites");

                var favorite = new UserInventoryFavorites
                {
                    User_ID = userId,
                    Product_ID = dto.Product_ID,
                    CreatedAt = DateTime.UtcNow
                };

                _context.UserInventoryFavorites.Add(favorite);
                await _context.SaveChangesAsync();

                // Fetch the complete favorite with related data
                var createdFavorite = await _context.UserInventoryFavorites
                    .Where(f => f.Favorite_ID == favorite.Favorite_ID)
                    .Include(f => f.Product)
                        .ThenInclude(p => p.Brand)
                    .Include(f => f.Product)
                        .ThenInclude(p => p.Category)
                    .Include(f => f.Product)
                        .ThenInclude(p => p.Variant)
                    .Select(f => new UserFavoriteDto
                    {
                        Favorite_ID = f.Favorite_ID,
                        Product_ID = f.Product_ID,
                        Product_Code = f.Product.Product_Code,
                        Product_Name = f.Product.Product_Name,
                        Description = f.Product.Description,
                        Brand_Name = f.Product.Brand.BrandName,
                        Category_Name = f.Product.Category.Category_Name,
                        Variant_Name = f.Product.Variant.Variant_Name,
                        CreatedAt = f.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                return CreatedAtAction(nameof(GetUserFavorites), new { id = favorite.Favorite_ID }, createdFavorite);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/user-favorites/{favoriteId}
        [HttpDelete("{favoriteId}")]
        public async Task<IActionResult> RemoveFavorite(int favoriteId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                var favorite = await _context.UserInventoryFavorites
                    .FirstOrDefaultAsync(f => f.Favorite_ID == favoriteId && f.User_ID == userId);

                if (favorite == null)
                    return NotFound("Favorite not found");

                _context.UserInventoryFavorites.Remove(favorite);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Favorite removed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/user-favorites/by-product/{productId}
        [HttpDelete("by-product/{productId}")]
        public async Task<IActionResult> RemoveFavoriteByProduct(int productId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                var favorite = await _context.UserInventoryFavorites
                    .FirstOrDefaultAsync(f => f.Product_ID == productId && f.User_ID == userId);

                if (favorite == null)
                    return NotFound("Favorite not found");

                _context.UserInventoryFavorites.Remove(favorite);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Favorite removed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/user-favorites/check/{productId}
        [HttpGet("check/{productId}")]
        public async Task<IActionResult> CheckIfFavorited(int productId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User not authenticated");

                var isFavorited = await _context.UserInventoryFavorites
                    .AnyAsync(f => f.User_ID == userId && f.Product_ID == productId);

                return Ok(new { isFavorited, productId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
