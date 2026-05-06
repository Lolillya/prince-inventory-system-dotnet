using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models.Inventory;
using Microsoft.EntityFrameworkCore;

namespace backend.Data.Seeders;

public class InventoryProduct
{
    public static void SeedProductData(ModelBuilder modelBuilder)
    {
        var seededAt = new DateTime(2025, 01, 01, 00, 00, 00, DateTimeKind.Utc);
        var product = new List<Product>
        {
            // Writing Instruments
            new Product
            {
                Product_ID = 1,
                Product_Code = "PILOT-G2-07-BLK",
                Core_Product_Code = "0010010001",
                Product_Name = "Pilot G2 0.7 Gel Pen - Black",
                Description = "Smooth writing gel ink pen with 0.7mm tip",
                Brand_ID = 1,
                Category_ID = 1,
                Variant_ID = 1,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 2,
                Product_Code = "BIC-CRYSTAL-BLK",
                Core_Product_Code = "0010020002",
                Product_Name = "Bic Crystal Ballpoint Pen - Black",
                Description = "Classic ballpoint pen with smooth writing",
                Brand_ID = 2,
                Category_ID = 1,
                Variant_ID = 2,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 3,
                Product_Code = "PENTEL-ENERGEL-05-BLU",
                Core_Product_Code = "0010070003",
                Product_Name = "Pentel EnerGel 0.5mm Gel Pen - Blue",
                Description = "Fast-drying gel pen with precise 0.5mm tip",
                Brand_ID = 7,
                Category_ID = 1,
                Variant_ID = 3,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 4,
                Product_Code = "SHARPIE-FINE-BLK",
                Core_Product_Code = "0010080004",
                Product_Name = "Sharpie Fine Point Permanent Marker - Black",
                Description = "Permanent marker with fine point for detailed work",
                Brand_ID = 8,
                Category_ID = 1,
                Variant_ID = 4,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 5,
                Product_Code = "EXPO-DRY-ERASE-BLK",
                Core_Product_Code = "0010090005",
                Product_Name = "Expo Dry Erase Marker - Black",
                Description = "Low-odor dry erase marker for whiteboards",
                Brand_ID = 9,
                Category_ID = 1,
                Variant_ID = 5,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 6,
                Product_Code = "TICONDEROGA-2-PENCIL",
                Core_Product_Code = "0010150006",
                Product_Name = "Ticonderoga #2 Pencil",
                Description = "Premium #2 pencil with soft graphite",
                Brand_ID = 15,
                Category_ID = 1,
                Variant_ID = 6,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            
            // Art Supplies
            new Product
            {
                Product_ID = 7,
                Product_Code = "CRAYOLA-24-CRAYONS",
                Core_Product_Code = "0020100007",
                Product_Name = "Crayola 24-Count Crayons",
                Description = "Classic 24-count box of crayons",
                Brand_ID = 10,
                Category_ID = 2,
                Variant_ID = 7,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 8,
                Product_Code = "PRISMACOLOR-12-PENCILS",
                Core_Product_Code = "0020110008",
                Product_Name = "Prismacolor Premier Colored Pencils - 12 Count",
                Description = "Professional quality colored pencils",
                Brand_ID = 11,
                Category_ID = 2,
                Variant_ID = 8,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 9,
                Product_Code = "STAEDTLER-12-MARKERS",
                Core_Product_Code = "0020050009",
                Product_Name = "Staedtler Triplus Fineliner - 12 Count",
                Description = "Fine-tip markers in assorted colors",
                Brand_ID = 5,
                Category_ID = 2,
                Variant_ID = 9,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 10,
                Product_Code = "FABER-CASTELL-12-PENCILS",
                Core_Product_Code = "0020060010",
                Product_Name = "Faber-Castell Colored Pencils - 12 Count",
                Description = "High-quality colored pencils for art projects",
                Brand_ID = 6,
                Category_ID = 2,
                Variant_ID = 10,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            
            // Notebooks & Paper
            new Product
            {
                Product_ID = 11,
                Product_Code = "MOLESKINE-CLASSIC-NOTEBOOK",
                Core_Product_Code = "0030120011",
                Product_Name = "Moleskine Classic Notebook - Large",
                Description = "Hardcover notebook with ruled pages",
                Brand_ID = 12,
                Category_ID = 3,
                Variant_ID = 11,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 12,
                Product_Code = "OXFORD-SPIRAL-NOTEBOOK",
                Core_Product_Code = "0030130012",
                Product_Name = "Oxford Spiral Notebook - College Ruled",
                Description = "200-page spiral notebook with college ruled paper",
                Brand_ID = 13,
                Category_ID = 3,
                Variant_ID = 12,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 13,
                Product_Code = "MEAD-COMPOSITION-BOOK",
                Core_Product_Code = "0030140013",
                Product_Name = "Mead Composition Book - Wide Ruled",
                Description = "100-sheet composition book with wide ruled pages",
                Brand_ID = 14,
                Category_ID = 3,
                Variant_ID = 13,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            
            // Office Supplies
            new Product
            {
                Product_ID = 14,
                Product_Code = "STAPLES-HEAVY-DUTY",
                Core_Product_Code = "0040020014",
                Product_Name = "Heavy Duty Staples - 5000 Count",
                Description = "Standard size staples for heavy duty staplers",
                Brand_ID = 2,
                Category_ID = 4,
                Variant_ID = 14,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 15,
                Product_Code = "PAPER-CLIPS-MIXED",
                Core_Product_Code = "0040020015",
                Product_Name = "Mixed Size Paper Clips - 100 Count",
                Description = "Assorted sizes paper clips for document organization",
                Brand_ID = 2,
                Category_ID = 4,
                Variant_ID = 15,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            }
        };

        modelBuilder.Entity<Product>().HasData(product);


    }
}
