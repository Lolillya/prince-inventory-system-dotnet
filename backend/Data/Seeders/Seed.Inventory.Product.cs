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
                Product_Code = "001-001-0001",
                Core_Product_Code = "0010010001",
                Product_Name = "Gel Pen - Pilot - Single Pack",
                Description = "Smooth writing gel ink pen with 0.7mm tip",
                Item_ID = 1,
                Brand_ID = 1,
                Category_ID = 1,
                Variant_ID = 1,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 2,
                Product_Code = "002-002-0002",
                Core_Product_Code = "0020020002",
                Product_Name = "Ballpoint Pen - Bic - 12-Pack",
                Description = "Classic ballpoint pen with smooth writing",
                Item_ID = 2,
                Brand_ID = 2,
                Category_ID = 1,
                Variant_ID = 2,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 3,
                Product_Code = "001-007-0003",
                Core_Product_Code = "0010070003",
                Product_Name = "Gel Pen - Pentel - 3-Pack",
                Description = "Fast-drying gel pen with precise 0.5mm tip",
                Item_ID = 1,
                Brand_ID = 7,
                Category_ID = 1,
                Variant_ID = 3,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 4,
                Product_Code = "003-008-0004",
                Core_Product_Code = "0030080004",
                Product_Name = "Permanent Marker - Sharpie - 4-Pack",
                Description = "Permanent marker with fine point for detailed work",
                Item_ID = 3,
                Brand_ID = 8,
                Category_ID = 1,
                Variant_ID = 4,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 5,
                Product_Code = "004-009-0005",
                Core_Product_Code = "0040090005",
                Product_Name = "Dry Erase Marker - Expo - 4-Pack Assorted Colors",
                Description = "Low-odor dry erase marker for whiteboards",
                Item_ID = 4,
                Brand_ID = 9,
                Category_ID = 1,
                Variant_ID = 5,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 6,
                Product_Code = "005-015-0006",
                Core_Product_Code = "0050150006",
                Product_Name = "Pencil - Ticonderoga - 12-Pack",
                Description = "Premium #2 pencil with soft graphite",
                Item_ID = 5,
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
                Product_Code = "006-010-0007",
                Core_Product_Code = "0060100007",
                Product_Name = "Crayon - Crayola - 24-Count Box",
                Description = "Classic 24-count box of crayons",
                Item_ID = 6,
                Brand_ID = 10,
                Category_ID = 2,
                Variant_ID = 7,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 8,
                Product_Code = "007-011-0008",
                Core_Product_Code = "0070110008",
                Product_Name = "Colored Pencil - Prismacolor - 12-Count Set",
                Description = "Professional quality colored pencils",
                Item_ID = 7,
                Brand_ID = 11,
                Category_ID = 2,
                Variant_ID = 8,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 9,
                Product_Code = "008-005-0009",
                Core_Product_Code = "0080050009",
                Product_Name = "Fineliner - Staedtler - 12-Count Assorted",
                Description = "Fine-tip markers in assorted colors",
                Item_ID = 8,
                Brand_ID = 5,
                Category_ID = 2,
                Variant_ID = 9,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 10,
                Product_Code = "007-006-0010",
                Core_Product_Code = "0070060010",
                Product_Name = "Colored Pencil - Faber-Castell - 12-Count Set",
                Description = "High-quality colored pencils for art projects",
                Item_ID = 7,
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
                Product_Code = "009-012-0011",
                Core_Product_Code = "0090120011",
                Product_Name = "Notebook - Moleskine - Large (5\" x 8.25\")",
                Description = "Hardcover notebook with ruled pages",
                Item_ID = 9,
                Brand_ID = 12,
                Category_ID = 3,
                Variant_ID = 11,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 12,
                Product_Code = "009-013-0012",
                Core_Product_Code = "0090130012",
                Product_Name = "Notebook - Oxford - 200 Pages",
                Description = "200-page spiral notebook with college ruled paper",
                Item_ID = 9,
                Brand_ID = 13,
                Category_ID = 3,
                Variant_ID = 12,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 13,
                Product_Code = "010-014-0013",
                Core_Product_Code = "0100140013",
                Product_Name = "Composition Book - Mead - 100 Sheets",
                Description = "100-sheet composition book with wide ruled pages",
                Item_ID = 10,
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
                Product_Code = "011-002-0014",
                Core_Product_Code = "0110020014",
                Product_Name = "Staple - Bic - 5000 Count Box",
                Description = "Standard size staples for heavy duty staplers",
                Item_ID = 11,
                Brand_ID = 2,
                Category_ID = 4,
                Variant_ID = 14,
                CreatedAt = seededAt,
                UpdatedAt = seededAt
            },
            new Product
            {
                Product_ID = 15,
                Product_Code = "012-002-0015",
                Core_Product_Code = "0120020015",
                Product_Name = "Paper Clip - Bic - 100 Count Mixed Sizes",
                Description = "Assorted sizes paper clips for document organization",
                Item_ID = 12,
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
