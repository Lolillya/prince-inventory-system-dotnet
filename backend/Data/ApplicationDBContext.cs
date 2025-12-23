using backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using backend.Models.Inventory;
using backend.Models.InvoiceModel;
using backend.Models.RestockModel;
using backend.Models.LineItems;
using backend.Models.Unit;
using backend.Models.Users;

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
        public DbSet<Restock> Restocks { get; set; }
        public DbSet<RestockBatch> RestockBatches { get; set; }
        public DbSet<RestockLineItems> RestockLineItems { get; set; }
        public DbSet<UnitOfMeasure> UnitOfMeasure { get; set; }
        public DbSet<Product_UOM> Product_UOMs { get; set; }
        public DbSet<DeletedUsers> DeletedUsers { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Seed roles
            Seeders.Roles.SeedRoles(builder);

            // Seed users
            Seeders.Users.UserDataSeed(builder);
            // Seeders.Suppliers.SeedSupplierUsers(builder);

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

                entity.HasOne(i => i.PersonalDetails)
                .WithMany()
                .HasForeignKey(i => i.Inventory_Clerk)
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

            // Restock Configuration
            builder.Entity<Restock>(entity =>
            {
                entity.ToTable("Restock");

                entity.HasOne(r => r.Clerk)
                    .WithMany()
                    .HasForeignKey(r => r.Restock_Clerk)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasMany(r => r.RestockBatches)
                    .WithOne(rb => rb.Restock)
                    .HasForeignKey(rb => rb.Restock_ID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // RestockBatch Configuration
            builder.Entity<RestockBatch>(entity =>
            {
                entity.ToTable("RestockBatch");

                entity.HasOne(rb => rb.Restock)
                    .WithMany(r => r.RestockBatches)
                    .HasForeignKey(rb => rb.Restock_ID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(rb => rb.Supplier)
                    .WithMany()
                    .HasForeignKey(rb => rb.Supplier_ID)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasMany(rb => rb.RestockLineItems)
                    .WithOne(rli => rli.RestockBatch)
                    .HasForeignKey(rli => rli.Batch_ID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // RestockLineItems Configuration
            builder.Entity<RestockLineItems>(entity =>
            {
                entity.ToTable("RestockLineItems");

                entity.HasOne(rli => rli.Product)
                    .WithMany()
                    .HasForeignKey(rli => rli.Product_ID)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(rli => rli.RestockBatch)
                    .WithMany(rb => rb.RestockLineItems)
                    .HasForeignKey(rli => rli.Batch_ID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(rli => rli.BaseUnitOfMeasure)
                    .WithMany()
                    .HasForeignKey(rli => rli.Base_UOM_ID)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasMany(rli => rli.ProductUOMs)
                    .WithOne(puom => puom.RestockLineItem)
                    .HasForeignKey(puom => puom.LineItem_ID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<InvoiceLineItems>(entity =>
            {
                entity.ToTable("InvoiceLineItems");

                entity.HasOne(ili => ili.Product)
                    .WithMany()
                    .HasForeignKey(ili => ili.Product_ID)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(ili => ili.Invoices)
                    .WithMany(i => i.LineItems)
                    .HasForeignKey(ili => ili.Invoice_ID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ili => ili.UnitOfMeasure)
                    .WithMany()
                    .HasForeignKey(ili => ili.UOM_ID)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // Product_UOM Configuration
            builder.Entity<Product_UOM>(entity =>
            {
                entity.ToTable("Product_UOM");

                entity.HasOne(puom => puom.RestockLineItem)
                    .WithMany(rli => rli.ProductUOMs)
                    .HasForeignKey(puom => puom.LineItem_ID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(puom => puom.UnitOfMeasure)
                    .WithMany()
                    .HasForeignKey(puom => puom.UOM_ID)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(puom => puom.ParentUnitOfMeasure)
                    .WithMany()
                    .HasForeignKey(puom => puom.Parent_UOM_ID)
                    .OnDelete(DeleteBehavior.NoAction);
            });

        }
    }
}