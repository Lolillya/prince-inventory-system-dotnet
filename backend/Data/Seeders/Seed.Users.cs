using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using backend.Models;

namespace backend.Data.Seeders;

public static class Users
{
    public static void UserDataSeed(ModelBuilder builder)
    {

        // Admin User
        var adminUser = new PersonalDetails
        {
            Id = "1",
            UserName = "admin",
            NormalizedUserName = "ADMIN",
            Email = "admin@prince.edu",
            NormalizedEmail = "ADMIN@PRINCE.EDU",
            Address = "123 Admin St, Cityville",
            EmailConfirmed = true,
            FirstName = "System",
            LastName = "Administrator",
            CompanyName = "Prince Educational Supply",
            Notes = "System Administrator Account",
            PhoneNumber = "1234567890",
            SecurityStamp = "7c4c8c0a-9b3a-4e5f-9d1c-1a2b3c4d5e6f",
            ConcurrencyStamp = "8d5e6f7a-1b2c-3d4e-5f6a-7b8c9d0e1f2a",
            LockoutEnabled = true,
            TwoFactorEnabled = false,
            AccessFailedCount = 0
        };
        adminUser.PasswordHash = "$2a$12$jp5zIIJOL8xuwDJ8iFQ71eCo8SkyYUe.EzycyKo9x8avU63OE./DK"; // Admin@123

        // Employee User
        var employeeUser = new PersonalDetails
        {
            Id = "2",
            UserName = "employee",
            NormalizedUserName = "EMPLOYEE",
            Email = "employee@prince.edu",
            NormalizedEmail = "EMPLOYEE@PRINCE.EDU",
            Address = "456 Employee Rd, Cityville",
            EmailConfirmed = true,
            FirstName = "John",
            LastName = "Doe",
            CompanyName = "Prince Educational Supply",
            Notes = "Inventory Manager",
            PhoneNumber = "2345678901",
            SecurityStamp = "9d0e1f2a-3b4c-5d6e-7f8a-9b0c1d2e3f4a",
            ConcurrencyStamp = "0e1f2a3b-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
            LockoutEnabled = true,
            TwoFactorEnabled = false,
            AccessFailedCount = 0
        };
        employeeUser.PasswordHash = "$2a$12$ftZOEZ3bCuHwb8sY3q4TK.9842WEhzdptOPQdDGYnfyFt0Wr.Fhbi"; //Employee@123

        // Supplier User
        var supplierUser = new PersonalDetails
        {
            Id = "3",
            UserName = "supplier",
            NormalizedUserName = "SUPPLIER",
            Email = "supplier@example.com",
            NormalizedEmail = "SUPPLIER@EXAMPLE.COM",
            Address = "789 Supplier Ave, Townsville",
            EmailConfirmed = true,
            FirstName = "Jane",
            LastName = "Smith",
            CompanyName = "Educational Supplies Inc.",
            Notes = "Main supplier of stationery",
            PhoneNumber = "3456789012",
            SecurityStamp = "1f2a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
            ConcurrencyStamp = "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d",
            LockoutEnabled = true,
            TwoFactorEnabled = false,
            AccessFailedCount = 0
        };
        supplierUser.PasswordHash = "$2a$12$ycj3WiWbM50s0umHkb3ZmuX9BHbrfhmZm8Ps58grA/E2GdF2BG1Ge"; // Supplier@123

        // Customer User
        var customerUser = new PersonalDetails
        {
            Id = "4",
            UserName = "customer",
            NormalizedUserName = "CUSTOMER",
            Email = "customer@example.com",
            NormalizedEmail = "CUSTOMER@EXAMPLE.COM",
            Address = "101 Customer Blvd, Villageville",
            EmailConfirmed = true,
            FirstName = "Robert",
            LastName = "Johnson",
            CompanyName = "Johnson Elementary School",
            Notes = "Regular customer - monthly orders",
            PhoneNumber = "4567890123",
            SecurityStamp = "3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e",
            ConcurrencyStamp = "4c5d6e7f-8a9b-0c1d-2e3f-4a5b6c7d8e9f",
            LockoutEnabled = true,
            TwoFactorEnabled = false,
            AccessFailedCount = 0
        };
        customerUser.PasswordHash = "$2a$12$qg9Dg6MBwphaDdYWImxO7O8pwjz9NWz28r9hGiCWnDLtVa0ynK9W2";

        // Add users to the database
        builder.Entity<PersonalDetails>().HasData(
            adminUser,
            employeeUser,
            supplierUser,
            customerUser
        );

        // Assign roles to users
        builder.Entity<IdentityUserRole<string>>().HasData(
            new IdentityUserRole<string> { UserId = "1", RoleId = "1" }, // Admin
            new IdentityUserRole<string> { UserId = "2", RoleId = "2" }, // Employee
            new IdentityUserRole<string> { UserId = "3", RoleId = "3" }, // Supplier
            new IdentityUserRole<string> { UserId = "4", RoleId = "4" }  // Customer
        );
    }
}
