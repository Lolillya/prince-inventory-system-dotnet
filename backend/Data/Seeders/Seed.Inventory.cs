using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models.Inventory;
using Microsoft.EntityFrameworkCore;

namespace backend.Data.Seeders;

public static class SeedInventory
{
    public static void SeedInventoryData(ModelBuilder modelBuilder)
    {
        var seededAt = new DateTime(2025, 01, 01, 00, 00, 00, DateTimeKind.Utc);
        var inventory = new List<Inventory>
        {
            // Writing Instruments Inventory
            new Inventory {
                Inventory_ID = 1,
                Product_ID = 1,
                Total_Quantity = 150,
                Inventory_Number = 1001,
                Inventory_Clerk = "John Smith",
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 2,
                Product_ID = 2,
                Total_Quantity = 75,
                Inventory_Number = 1002,
                Inventory_Clerk = "Sarah Johnson",
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 3,
                Product_ID = 3,
                Total_Quantity = 200,
                Inventory_Number = 1003,
                Inventory_Clerk = "Mike Davis",
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 4,
                Product_ID = 4,
                Total_Quantity = 120,
                Inventory_Number = 1004,
                Inventory_Clerk = "Lisa Wilson",
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 5,
                Product_ID = 5,
                Total_Quantity = 80,
                Inventory_Number = 1005,
                Inventory_Clerk = "Tom Brown",
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 6,
                Product_ID = 6,
                Total_Quantity = 300,
                Inventory_Number = 1006,
                Inventory_Clerk = "Emma Taylor",
                Created_At = seededAt,
                Updated_At = seededAt
            },
            
            // Art Supplies Inventory
            new Inventory {
                Inventory_ID = 7,
                Product_ID = 7,
                Total_Quantity = 50,
                Inventory_Number = 1007,
                Inventory_Clerk = "John Smith",
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 8,
                Product_ID = 8,
                Total_Quantity = 30,
                Inventory_Number = 1008,
                Inventory_Clerk = "Sarah Johnson",
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 9,
                Product_ID = 9,
                Total_Quantity = 40,
                Inventory_Number = 1009,
                Inventory_Clerk = "Mike Davis",
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 10,
                Product_ID = 10,
                Total_Quantity = 25,
                Inventory_Number = 1010,
                Inventory_Clerk = "Lisa Wilson",
                Created_At = seededAt,
                Updated_At = seededAt
            },
            
            // Notebooks & Paper Inventory
            new Inventory {
                Inventory_ID = 11,
                Product_ID = 11,
                Total_Quantity = 60,
                Inventory_Number = 1011,
                Inventory_Clerk = "Tom Brown",
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 12,
                Product_ID = 12,
                Total_Quantity = 100,
                Inventory_Number = 1012,
                Inventory_Clerk = "Emma Taylor",
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 13,
                Product_ID = 13,
                Total_Quantity = 200,
                Inventory_Number = 1013,
                Inventory_Clerk = "John Smith",
                Created_At = seededAt,
                Updated_At = seededAt
            },
            
            // Office Supplies Inventory
            new Inventory {
                Inventory_ID = 14,
                Product_ID = 14,
                Total_Quantity = 15,
                Inventory_Number = 1014,
                Inventory_Clerk = "Sarah Johnson",
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 15,
                Product_ID = 15,
                Total_Quantity = 25,
                Inventory_Number = 1015,
                Inventory_Clerk = "Mike Davis",
                Created_At = seededAt,
                Updated_At = seededAt
            }
        };

        modelBuilder.Entity<Inventory>().HasData(inventory);
    }
}
