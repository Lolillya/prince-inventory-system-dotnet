using backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using backend.Models.Inventory;
using backend.Models.InvoiceModel;
using backend.Models.RestockModel;
using backend.Models.LineItems;
using backend.Models.Unit;

namespace backend.Data
{
    public class ApplicationDBContext : IdentityDbContext<PersonalDetails>
    {
        public ApplicationDBContext(DbContextOptions dbContextOptions)
        : base(dbContextOptions)
        {

        }

        public DbSet<Brand> Brands { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Variant> Variants { get; set; }
        public DbSet<Inventory> Inventory { get; set; }
        public DbSet<Invoice> Invoice { get; set; }
        public DbSet<InvoiceLineItems> InvoiceLineItems { get; set; }
        public DbSet<RestockLineItems> RestockLineItems { get; set; }
        public DbSet<Restock> Restocks { get; set; }
        public DbSet<RestockBatch> RestocksBatch { get; set; }
        public DbSet<UnitOfMeasure> UnitOfMeasure { get; set; }
        public DbSet<Product_UOM> Product_UOMs { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);



            // Seed roles
            Seeders.Roles.SeedRoles(builder);

            // Seed users
            Seeders.Users.UserDataSeed(builder);
            Seeders.Suppliers.SeedSupplierUsers(builder);

            // Seed Inventory items
            Seeders.BrandInventory.SeedBrandData(builder);
            Seeders.CategoryInventory.SeedCategoryData(builder);
            Seeders.InventoryProduct.SeedProductData(builder);
            Seeders.SeedInventory.SeedInventoryData(builder);
            Seeders.VariantInventory.SeedVariantData(builder);
            // Seeders.SeedInvoice.SeedInvoiceData(builder);

            // Seed Unit of Measure
            Seeders.SeedUnitOfMeasure.SeedUnitOfMeasureData(builder);

            builder.Entity<Inventory>(entity =>
            {
                entity.ToTable("Inventory");

                entity.HasOne(i => i.Product)
                 .WithMany()
                 .HasForeignKey(i => i.Product_ID)
                 .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<Product>(entity =>
            {
                entity.ToTable("Products");

                entity.HasOne(p => p.Variant)
                    .WithMany()
                    .HasForeignKey(p => p.Variant_ID)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(p => p.Brand)
                    .WithMany()
                    .HasForeignKey(p => p.Brand_ID)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(p => p.Category)
                    .WithMany()
                    .HasForeignKey(p => p.Category_ID)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<Invoice>(entity =>
            {
                entity.ToTable("Invoice");

                entity.HasOne(i => i.Customer)
                    .WithMany()
                    .HasForeignKey(i => i.Customer_ID)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(i => i.Clerk)
                    .WithMany()
                    .HasForeignKey(i => i.Invoice_Clerk)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<Restock>(entity =>
            {
                entity.ToTable("Restock");

                entity.HasOne(r => r.Clerk)
                    .WithMany()
                    .HasForeignKey(r => r.Restock_Clerk)
                    .OnDelete(DeleteBehavior.NoAction);

                // Restock has many LineItems
                // Use the lambda expression for the FK property to avoid creating duplicate FK columns
                entity.HasMany(r => r.LineItems)
                    .WithOne(li => li.Restock)
                    .HasForeignKey(li => li.Restock_ID)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(r => r.restockBatch)
                    .WithMany()
                    .HasForeignKey(r => r.Batch_ID)
                    .OnDelete(DeleteBehavior.NoAction);


            });

            builder.Entity<RestockLineItems>(entity =>
            {
                entity.ToTable("RestockLineItems");

                entity.HasOne(li => li.Product)
                    .WithMany()
                    .HasForeignKey(li => li.Product_ID)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(li => li.Restock)
                    .WithMany(li => li.LineItems)
                    .HasForeignKey(li => li.Restock_ID)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<Product_UOM>(entity =>
            {
                entity.ToTable("Product_UOM");

                entity.HasOne(u => u.Product)
                    .WithMany()
                    .HasForeignKey(u => u.Product_Id)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(u => u.UnitOfMeasure)
                    .WithMany()
                    .HasForeignKey(u => u.UOM_Id)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(u => u.RestockBatch)
                    .WithMany()
                    .HasForeignKey(u => u.Batch_Id)
                    .OnDelete(DeleteBehavior.NoAction);
            });

        }
    }
}