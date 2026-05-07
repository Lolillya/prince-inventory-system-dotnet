using backend.Models.Inventory;
using Microsoft.EntityFrameworkCore;

namespace backend.Data.Seeders;

public static class InventoryItem
{
    public static void SeedItemData(ModelBuilder modelBuilder)
    {
        var seededAt = new DateTime(2025, 01, 01, 00, 00, 00, DateTimeKind.Utc);
        var items = new List<Item>
        {
            new Item { Item_ID = 1,  ItemName = "Gel Pen",          Item_Code = "001", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Item { Item_ID = 2,  ItemName = "Ballpoint Pen",     Item_Code = "002", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Item { Item_ID = 3,  ItemName = "Permanent Marker",  Item_Code = "003", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Item { Item_ID = 4,  ItemName = "Dry Erase Marker",  Item_Code = "004", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Item { Item_ID = 5,  ItemName = "Pencil",            Item_Code = "005", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Item { Item_ID = 6,  ItemName = "Crayon",            Item_Code = "006", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Item { Item_ID = 7,  ItemName = "Colored Pencil",    Item_Code = "007", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Item { Item_ID = 8,  ItemName = "Fineliner",         Item_Code = "008", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Item { Item_ID = 9,  ItemName = "Notebook",          Item_Code = "009", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Item { Item_ID = 10, ItemName = "Composition Book",  Item_Code = "010", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Item { Item_ID = 11, ItemName = "Staple",            Item_Code = "011", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Item { Item_ID = 12, ItemName = "Paper Clip",        Item_Code = "012", CreatedAt = seededAt, UpdatedAt = seededAt },
        };

        modelBuilder.Entity<Item>().HasData(items);
    }
}
