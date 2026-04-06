using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Data.Seeders;

public static class InternalUsers
{
    // Stable ID used throughout the codebase to reference the company itself as a supplier.
    public const string PrinceSupplierUserId = "00000000-0000-0000-0000-000000000001";

    public static void SeedInternalUsers(ModelBuilder modelBuilder)
    {
        var internalUsers = new List<PersonalDetails>
        {
            new PersonalDetails
            {
                Id = PrinceSupplierUserId,
                UserName = "princeeducationalsupplies",
                NormalizedUserName = "PRINCEEDUCATIONALSUPPLIES",
                Email = "internal@princeeducationalsupplies.com",
                NormalizedEmail = "INTERNAL@PRINCEEDUCATIONALSUPPLIES.COM",
                EmailConfirmed = true,
                FirstName = "Prince",
                LastName = "Educational",
                CompanyName = "Prince Educational Supplies",
                Notes = "Internal company account used for auto-replenish restock records",
                PhoneNumber = "0000000000",
                SecurityStamp = "00000000-0000-0000-0000-000000000001",
                ConcurrencyStamp = "00000000-0000-0000-0000-000000000001",
                LockoutEnabled = false,
                TwoFactorEnabled = false,
                AccessFailedCount = 0,
                // Intentionally unusable password hash — this account should never log in directly.
                PasswordHash = "$2a$12$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
            }
        };

        modelBuilder.Entity<PersonalDetails>().HasData(internalUsers);

        // Assign supplier role (role ID "3") so it can be referenced as a restock supplier.
        var userRoles = internalUsers.Select(u =>
            new IdentityUserRole<string> { UserId = u.Id, RoleId = "3" }
        ).ToList();

        modelBuilder.Entity<IdentityUserRole<string>>().HasData(userRoles);
    }
}
