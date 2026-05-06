using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models.Inventory;
using Microsoft.EntityFrameworkCore;

namespace backend.Data.Seeders;

public static class BrandInventory
{
    public static void SeedBrandData(ModelBuilder modelBuilder)
    {
        var seededAt = new DateTime(2025, 01, 01, 00, 00, 00, DateTimeKind.Utc);
        var brands = new List<Brand>
        {
            new Brand
            {
                Brand_ID = 1,
                BrandName = "Pilot",
                Brand_Code = "001",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Brand
            {
                Brand_ID = 2,
                BrandName = "Bic",
                Brand_Code = "002",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Brand
            {
                Brand_ID = 3,
                BrandName = "Parker",
                Brand_Code = "003",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Brand
            {
                Brand_ID = 4,
                BrandName = "Fiber Castel",
                Brand_Code = "004",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Brand
            {
                Brand_ID = 5,
                BrandName = "Staedtler",
                Brand_Code = "005",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Brand
            {
                Brand_ID = 6,
                BrandName = "Faber-Castell",
                Brand_Code = "006",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Brand
            {
                Brand_ID = 7,
                BrandName = "Pentel",
                Brand_Code = "007",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Brand
            {
                Brand_ID = 8,
                BrandName = "Sharpie",
                Brand_Code = "008",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Brand
            {
                Brand_ID = 9,
                BrandName = "Expo",
                Brand_Code = "009",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Brand
            {
                Brand_ID = 10,
                BrandName = "Crayola",
                Brand_Code = "010",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Brand
            {
                Brand_ID = 11,
                BrandName = "Prismacolor",
                Brand_Code = "011",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Brand
            {
                Brand_ID = 12,
                BrandName = "Moleskine",
                Brand_Code = "012",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Brand
            {
                Brand_ID = 13,
                BrandName = "Oxford",
                Brand_Code = "013",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Brand
            {
                Brand_ID = 14,
                BrandName = "Mead",
                Brand_Code = "014",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Brand
            {
                Brand_ID = 15,
                BrandName = "Ticonderoga",
                Brand_Code = "015",
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            }
        };

        modelBuilder.Entity<Brand>().HasData(brands);
    }
}
