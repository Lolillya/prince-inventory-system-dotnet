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
                Total_Quantity = 0,
                Inventory_Number = 1001,
                Inventory_Clerk = "1", // Admin User
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 2,
                Product_ID = 2,
                Total_Quantity = 0,
                Inventory_Number = 1002,
                Inventory_Clerk = "2", // Employee User
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 3,
                Product_ID = 3,
                Total_Quantity = 0,
                Inventory_Number = 1003,
                Inventory_Clerk = "1", // Admin User
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 4,
                Product_ID = 4,
                Total_Quantity = 0,
                Inventory_Number = 1004,
                Inventory_Clerk = "2", // Employee User
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 5,
                Product_ID = 5,
                Total_Quantity = 0,
                Inventory_Number = 1005,
                Inventory_Clerk = "1", // Admin User
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 6,
                Product_ID = 6,
                Total_Quantity = 0,
                Inventory_Number = 1006,
                Inventory_Clerk = "2", // Employee User
                Created_At = seededAt,
                Updated_At = seededAt
            },
            
            // Art Supplies Inventory
            new Inventory {
                Inventory_ID = 7,
                Product_ID = 7,
                Total_Quantity = 0,
                Inventory_Number = 1007,
                Inventory_Clerk = "1", // Admin User
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 8,
                Product_ID = 8,
                Total_Quantity = 0,
                Inventory_Number = 1008,
                Inventory_Clerk = "2", // Employee User
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 9,
                Product_ID = 9,
                Total_Quantity = 0,
                Inventory_Number = 1009,
                Inventory_Clerk = "1", // Admin User
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 10,
                Product_ID = 10,
                Total_Quantity = 0,
                Inventory_Number = 1010,
                Inventory_Clerk = "2", // Employee User
                Created_At = seededAt,
                Updated_At = seededAt
            },
            
            // Notebooks & Paper Inventory
            new Inventory {
                Inventory_ID = 11,
                Product_ID = 11,
                Total_Quantity = 0,
                Inventory_Number = 1011,
                Inventory_Clerk = "1", // Admin User
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 12,
                Product_ID = 12,
                Total_Quantity = 0,
                Inventory_Number = 1012,
                Inventory_Clerk = "2", // Employee User
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 13,
                Product_ID = 13,
                Total_Quantity = 0,
                Inventory_Number = 1013,
                Inventory_Clerk = "1", // Admin User
                Created_At = seededAt,
                Updated_At = seededAt
            },
            
            // Office Supplies Inventory
            new Inventory {
                Inventory_ID = 14,
                Product_ID = 14,
                Total_Quantity = 0,
                Inventory_Number = 1014,
                Inventory_Clerk = "2", // Employee User
                Created_At = seededAt,
                Updated_At = seededAt
            },
            new Inventory {
                Inventory_ID = 15,
                Product_ID = 15,
                Total_Quantity = 0,
                Inventory_Number = 1015,
                Inventory_Clerk = "1", // Admin User
                Created_At = seededAt,
                Updated_At = seededAt
            }
        };

        modelBuilder.Entity<Inventory>().HasData(inventory);
    }
}
