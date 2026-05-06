using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models.Inventory;
using Microsoft.EntityFrameworkCore;

namespace backend.Data.Seeders;

public static class CategoryInventory
{
    public static void SeedCategoryData(ModelBuilder modelBuilder)
    {
        var seededAt = new DateTime(2025, 01, 01, 00, 00, 00, DateTimeKind.Utc);
        var category = new List<Category>
        {
            new Category
            {
                Category_ID = 1,
                Category_Name = "Writing Instruments",
                Category_Code = "001",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Category
            {
                Category_ID = 2,
                Category_Name = "Art Supplies",
                Category_Code = "002",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Category
            {
                Category_ID = 3,
                Category_Name = "Notebooks & Paper",
                Category_Code = "003",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Category
            {
                Category_ID = 4,
                Category_Name = "Office Supplies",
                Category_Code = "004",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Category
            {
                Category_ID = 5,
                Category_Name = "Classroom Tools",
                Category_Code = "005",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Category
            {
                Category_ID = 6,
                Category_Name = "Storage & Organization",
                Category_Code = "006",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Category
            {
                Category_ID = 7,
                Category_Name = "Technology Accessories",
                Category_Code = "007",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Category
            {
                Category_ID = 8,
                Category_Name = "Science & Lab Supplies",
                Category_Code = "008",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            }
        };

        modelBuilder.Entity<Category>().HasData(category);

    }
}
