using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models.Inventory;
using Microsoft.EntityFrameworkCore;

namespace backend.Data.Seeders;

public static class VariantInventory
{
    public static void SeedVariantData(ModelBuilder modelBuilder)
    {
        var seededAt = new DateTime(2025, 01, 01, 00, 00, 00, DateTimeKind.Utc);
        var variant = new List<Variant>
        {
            // Writing Instruments Variants
            new Variant
            {
                Variant_ID = 1,
                Variant_Name = "Single Pack",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Variant
            {
                Variant_ID = 2,
                Variant_Name = "12-Pack",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Variant
            {
                Variant_ID = 3,
                Variant_Name = "3-Pack",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Variant
            {
                Variant_ID = 4,
                Variant_Name = "4-Pack",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Variant
            {
                Variant_ID = 5,
                Variant_Name = "4-Pack Assorted Colors",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Variant
            {
                Variant_ID = 6,
                Variant_Name = "12-Pack",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            
            // Art Supplies Variants
            new Variant
            {
                Variant_ID = 7,
                Variant_Name = "24-Count Box",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Variant
            {
                Variant_ID = 8,
                Variant_Name = "12-Count Set",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Variant
            {
                Variant_ID = 9,
                Variant_Name = "12-Count Assorted",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Variant
            {
                Variant_ID = 10,
                Variant_Name = "12-Count Set",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            
            // Notebooks & Paper Variants
            new Variant
            {
                Variant_ID = 11,
                Variant_Name = "Large (5\" x 8.25\")",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Variant
            {
                Variant_ID = 12,
                Variant_Name = "200 Pages",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Variant
            {
                Variant_ID = 13,
                Variant_Name = "100 Sheets",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            
            // Office Supplies Variants
            new Variant
            {
                Variant_ID = 14,
                Variant_Name = "5000 Count Box",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Variant
            {
                Variant_ID = 15,
                Variant_Name = "100 Count Mixed Sizes",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            }
        };
        modelBuilder.Entity<Variant>().HasData(variant);
    }
}
