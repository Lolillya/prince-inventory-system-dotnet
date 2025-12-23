using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FixInvoiceLineItemFkConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Brands",
                columns: table => new
                {
                    Brand_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BrandName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brands", x => x.Brand_ID);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Category_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Category_Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Category_ID);
                });

            migrationBuilder.CreateTable(
                name: "DeletedUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeletedUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UnitOfMeasure",
                columns: table => new
                {
                    uom_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    uom_Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnitOfMeasure", x => x.uom_ID);
                });

            migrationBuilder.CreateTable(
                name: "Variants",
                columns: table => new
                {
                    Variant_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Variant_Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Variants", x => x.Variant_ID);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Invoice",
                columns: table => new
                {
                    Invoice_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Invoice_Number = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Customer_ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Invoice_Clerk = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Total_Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Term = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoice", x => x.Invoice_ID);
                    table.ForeignKey(
                        name: "FK_Invoice_AspNetUsers_Customer_ID",
                        column: x => x.Customer_ID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Invoice_AspNetUsers_Invoice_Clerk",
                        column: x => x.Invoice_Clerk,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Restock",
                columns: table => new
                {
                    Restock_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Restock_Clerk = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Restock_Number = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Restock_Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Restock", x => x.Restock_ID);
                    table.ForeignKey(
                        name: "FK_Restock_AspNetUsers_Restock_Clerk",
                        column: x => x.Restock_Clerk,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Product_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Product_Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Product_Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Brand_ID = table.Column<int>(type: "int", nullable: false),
                    Category_ID = table.Column<int>(type: "int", nullable: false),
                    Variant_ID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Product_ID);
                    table.ForeignKey(
                        name: "FK_Products_Brands_Brand_ID",
                        column: x => x.Brand_ID,
                        principalTable: "Brands",
                        principalColumn: "Brand_ID");
                    table.ForeignKey(
                        name: "FK_Products_Categories_Category_ID",
                        column: x => x.Category_ID,
                        principalTable: "Categories",
                        principalColumn: "Category_ID");
                    table.ForeignKey(
                        name: "FK_Products_Variants_Variant_ID",
                        column: x => x.Variant_ID,
                        principalTable: "Variants",
                        principalColumn: "Variant_ID");
                });

            migrationBuilder.CreateTable(
                name: "RestockBatch",
                columns: table => new
                {
                    Batch_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Restock_ID = table.Column<int>(type: "int", nullable: false),
                    Supplier_ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Batch_Number = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RestockBatch", x => x.Batch_ID);
                    table.ForeignKey(
                        name: "FK_RestockBatch_AspNetUsers_Supplier_ID",
                        column: x => x.Supplier_ID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RestockBatch_Restock_Restock_ID",
                        column: x => x.Restock_ID,
                        principalTable: "Restock",
                        principalColumn: "Restock_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Inventory",
                columns: table => new
                {
                    Inventory_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Product_ID = table.Column<int>(type: "int", nullable: false),
                    Total_Quantity = table.Column<int>(type: "int", nullable: false),
                    Inventory_Number = table.Column<int>(type: "int", nullable: false),
                    Created_At = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Updated_At = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Inventory_Clerk = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inventory", x => x.Inventory_ID);
                    table.ForeignKey(
                        name: "FK_Inventory_AspNetUsers_Inventory_Clerk",
                        column: x => x.Inventory_Clerk,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Inventory_Products_Product_ID",
                        column: x => x.Product_ID,
                        principalTable: "Products",
                        principalColumn: "Product_ID");
                });

            migrationBuilder.CreateTable(
                name: "InvoiceLineItems",
                columns: table => new
                {
                    LineItem_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Product_ID = table.Column<int>(type: "int", nullable: false),
                    Invoice_ID = table.Column<int>(type: "int", nullable: false),
                    UOM_ID = table.Column<int>(type: "int", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Unit_Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Sub_Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Unit_Quantity = table.Column<int>(type: "int", nullable: false),
                    Discount = table.Column<int>(type: "int", nullable: false),
                    isPercentageDiscount = table.Column<bool>(type: "bit", nullable: false),
                    Invoice_ID1 = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceLineItems", x => x.LineItem_ID);
                    table.ForeignKey(
                        name: "FK_InvoiceLineItems_Invoice_Invoice_ID",
                        column: x => x.Invoice_ID,
                        principalTable: "Invoice",
                        principalColumn: "Invoice_ID");
                    table.ForeignKey(
                        name: "FK_InvoiceLineItems_Invoice_Invoice_ID1",
                        column: x => x.Invoice_ID1,
                        principalTable: "Invoice",
                        principalColumn: "Invoice_ID");
                    table.ForeignKey(
                        name: "FK_InvoiceLineItems_Products_Product_ID",
                        column: x => x.Product_ID,
                        principalTable: "Products",
                        principalColumn: "Product_ID");
                    table.ForeignKey(
                        name: "FK_InvoiceLineItems_UnitOfMeasure_UOM_ID",
                        column: x => x.UOM_ID,
                        principalTable: "UnitOfMeasure",
                        principalColumn: "uom_ID");
                });

            migrationBuilder.CreateTable(
                name: "RestockLineItems",
                columns: table => new
                {
                    LineItem_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Product_ID = table.Column<int>(type: "int", nullable: false),
                    Batch_ID = table.Column<int>(type: "int", nullable: false),
                    Base_UOM_ID = table.Column<int>(type: "int", nullable: false),
                    Base_Unit_Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Base_Unit_Quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RestockLineItems", x => x.LineItem_ID);
                    table.ForeignKey(
                        name: "FK_RestockLineItems_Products_Product_ID",
                        column: x => x.Product_ID,
                        principalTable: "Products",
                        principalColumn: "Product_ID");
                    table.ForeignKey(
                        name: "FK_RestockLineItems_RestockBatch_Batch_ID",
                        column: x => x.Batch_ID,
                        principalTable: "RestockBatch",
                        principalColumn: "Batch_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RestockLineItems_UnitOfMeasure_Base_UOM_ID",
                        column: x => x.Base_UOM_ID,
                        principalTable: "UnitOfMeasure",
                        principalColumn: "uom_ID");
                });

            migrationBuilder.CreateTable(
                name: "Product_UOM",
                columns: table => new
                {
                    Product_UOM_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LineItem_ID = table.Column<int>(type: "int", nullable: false),
                    UOM_ID = table.Column<int>(type: "int", nullable: false),
                    Parent_UOM_ID = table.Column<int>(type: "int", nullable: true),
                    Conversion_Factor = table.Column<int>(type: "int", nullable: false),
                    Unit_Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product_UOM", x => x.Product_UOM_Id);
                    table.ForeignKey(
                        name: "FK_Product_UOM_RestockLineItems_LineItem_ID",
                        column: x => x.LineItem_ID,
                        principalTable: "RestockLineItems",
                        principalColumn: "LineItem_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Product_UOM_UnitOfMeasure_Parent_UOM_ID",
                        column: x => x.Parent_UOM_ID,
                        principalTable: "UnitOfMeasure",
                        principalColumn: "uom_ID");
                    table.ForeignKey(
                        name: "FK_Product_UOM_UnitOfMeasure_UOM_ID",
                        column: x => x.UOM_ID,
                        principalTable: "UnitOfMeasure",
                        principalColumn: "uom_ID");
                });

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "1", null, "Admin", "ADMIN" },
                    { "2", null, "Employee", "EMPLOYEE" },
                    { "3", null, "Supplier", "SUPPLIER" },
                    { "4", null, "Customer", "CUSTOMER" }
                });

            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "Address", "CompanyName", "ConcurrencyStamp", "Email", "EmailConfirmed", "FirstName", "LastName", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "Notes", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "UserName" },
                values: new object[,]
                {
                    { "1", 0, "123 Admin St, Cityville", "Prince Educational Supply", "8d5e6f7a-1b2c-3d4e-5f6a-7b8c9d0e1f2a", "admin@prince.edu", true, "System", "Administrator", true, null, "ADMIN@PRINCE.EDU", "ADMIN", "System Administrator Account", "$2a$12$jp5zIIJOL8xuwDJ8iFQ71eCo8SkyYUe.EzycyKo9x8avU63OE./DK", "1234567890", false, "7c4c8c0a-9b3a-4e5f-9d1c-1a2b3c4d5e6f", false, "admin" },
                    { "2", 0, "456 Employee Rd, Cityville", "Prince Educational Supply", "0e1f2a3b-4c5d-6e7f-8a9b-0c1d2e3f4a5b", "employee@prince.edu", true, "John", "Doe", true, null, "EMPLOYEE@PRINCE.EDU", "EMPLOYEE", "Inventory Manager", "$2a$12$ftZOEZ3bCuHwb8sY3q4TK.9842WEhzdptOPQdDGYnfyFt0Wr.Fhbi", "2345678901", false, "9d0e1f2a-3b4c-5d6e-7f8a-9b0c1d2e3f4a", false, "employee" },
                    { "3", 0, "789 Supplier Ave, Townsville", "Educational Supplies Inc.", "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d", "supplier@example.com", true, "Jane", "Smith", true, null, "SUPPLIER@EXAMPLE.COM", "SUPPLIER", "Main supplier of stationery", "$2a$12$ycj3WiWbM50s0umHkb3ZmuX9BHbrfhmZm8Ps58grA/E2GdF2BG1Ge", "3456789012", false, "1f2a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c", false, "supplier" },
                    { "4", 0, "101 Customer Blvd, Villageville", "Johnson Elementary School", "4c5d6e7f-8a9b-0c1d-2e3f-4a5b6c7d8e9f", "customer@example.com", true, "Robert", "Johnson", true, null, "CUSTOMER@EXAMPLE.COM", "CUSTOMER", "Regular customer - monthly orders", "$2a$12$qg9Dg6MBwphaDdYWImxO7O8pwjz9NWz28r9hGiCWnDLtVa0ynK9W2", "4567890123", false, "3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e", false, "customer" }
                });

            migrationBuilder.InsertData(
                table: "Brands",
                columns: new[] { "Brand_ID", "BrandName", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Pilot", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "Bic", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "Parker", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, "Fiber Castel", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, "Staedtler", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, "Faber-Castell", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 7, "Pentel", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 8, "Sharpie", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 9, "Expo", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 10, "Crayola", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 11, "Prismacolor", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 12, "Moleskine", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 13, "Oxford", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 14, "Mead", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 15, "Ticonderoga", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Category_ID", "Category_Name", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Writing Instruments", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "Art Supplies", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "Notebooks & Paper", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, "Office Supplies", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, "Classroom Tools", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, "Storage & Organization", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 7, "Technology Accessories", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 8, "Science & Lab Supplies", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "UnitOfMeasure",
                columns: new[] { "uom_ID", "uom_Name" },
                values: new object[,]
                {
                    { 1, "PIECES" },
                    { 2, "PADS" },
                    { 3, "SETS" },
                    { 4, "BOXES" },
                    { 5, "BUNDLES" },
                    { 6, "ROLLS" },
                    { 7, "GALLON" },
                    { 8, "PACKS" },
                    { 9, "TUBES" },
                    { 10, "CARTOONS" },
                    { 11, "CASE" },
                    { 12, "REAMS" }
                });

            migrationBuilder.InsertData(
                table: "Variants",
                columns: new[] { "Variant_ID", "CreatedAt", "UpdatedAt", "Variant_Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Single Pack" },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "12-Pack" },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "3-Pack" },
                    { 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "4-Pack" },
                    { 5, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "4-Pack Assorted Colors" },
                    { 6, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "12-Pack" },
                    { 7, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "24-Count Box" },
                    { 8, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "12-Count Set" },
                    { 9, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "12-Count Assorted" },
                    { 10, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "12-Count Set" },
                    { 11, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Large (5\" x 8.25\")" },
                    { 12, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "200 Pages" },
                    { 13, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "100 Sheets" },
                    { 14, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "5000 Count Box" },
                    { 15, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "100 Count Mixed Sizes" }
                });

            migrationBuilder.InsertData(
                table: "AspNetUserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[,]
                {
                    { "1", "1" },
                    { "2", "2" },
                    { "3", "3" },
                    { "4", "4" }
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Product_ID", "Brand_ID", "Category_ID", "CreatedAt", "Description", "Product_Code", "Product_Name", "UpdatedAt", "Variant_ID" },
                values: new object[,]
                {
                    { 1, 1, 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Smooth writing gel ink pen with 0.7mm tip", "PILOT-G2-07-BLK", "Pilot G2 0.7 Gel Pen - Black", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { 2, 2, 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Classic ballpoint pen with smooth writing", "BIC-CRYSTAL-BLK", "Bic Crystal Ballpoint Pen - Black", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { 3, 7, 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Fast-drying gel pen with precise 0.5mm tip", "PENTEL-ENERGEL-05-BLU", "Pentel EnerGel 0.5mm Gel Pen - Blue", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3 },
                    { 4, 8, 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Permanent marker with fine point for detailed work", "SHARPIE-FINE-BLK", "Sharpie Fine Point Permanent Marker - Black", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 4 },
                    { 5, 9, 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Low-odor dry erase marker for whiteboards", "EXPO-DRY-ERASE-BLK", "Expo Dry Erase Marker - Black", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5 },
                    { 6, 15, 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Premium #2 pencil with soft graphite", "TICONDEROGA-2-PENCIL", "Ticonderoga #2 Pencil", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 6 },
                    { 7, 10, 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Classic 24-count box of crayons", "CRAYOLA-24-CRAYONS", "Crayola 24-Count Crayons", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 7 },
                    { 8, 11, 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Professional quality colored pencils", "PRISMACOLOR-12-PENCILS", "Prismacolor Premier Colored Pencils - 12 Count", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 8 },
                    { 9, 5, 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Fine-tip markers in assorted colors", "STAEDTLER-12-MARKERS", "Staedtler Triplus Fineliner - 12 Count", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 9 },
                    { 10, 6, 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "High-quality colored pencils for art projects", "FABER-CASTELL-12-PENCILS", "Faber-Castell Colored Pencils - 12 Count", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 10 },
                    { 11, 12, 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Hardcover notebook with ruled pages", "MOLESKINE-CLASSIC-NOTEBOOK", "Moleskine Classic Notebook - Large", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 11 },
                    { 12, 13, 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "200-page spiral notebook with college ruled paper", "OXFORD-SPIRAL-NOTEBOOK", "Oxford Spiral Notebook - College Ruled", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 12 },
                    { 13, 14, 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "100-sheet composition book with wide ruled pages", "MEAD-COMPOSITION-BOOK", "Mead Composition Book - Wide Ruled", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 13 },
                    { 14, 2, 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Standard size staples for heavy duty staplers", "STAPLES-HEAVY-DUTY", "Heavy Duty Staples - 5000 Count", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 14 },
                    { 15, 2, 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Assorted sizes paper clips for document organization", "PAPER-CLIPS-MIXED", "Mixed Size Paper Clips - 100 Count", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 15 }
                });

            migrationBuilder.InsertData(
                table: "Inventory",
                columns: new[] { "Inventory_ID", "Created_At", "Inventory_Clerk", "Inventory_Number", "Product_ID", "Total_Quantity", "Updated_At" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "1", 1001, 1, 150, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "2", 1002, 2, 75, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "1", 1003, 3, 200, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "2", 1004, 4, 120, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "1", 1005, 5, 80, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "2", 1006, 6, 300, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 7, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "1", 1007, 7, 50, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 8, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "2", 1008, 8, 30, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 9, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "1", 1009, 9, 40, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 10, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "2", 1010, 10, 25, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 11, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "1", 1011, 11, 60, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 12, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "2", 1012, 12, 100, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 13, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "1", 1013, 13, 200, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 14, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "2", 1014, 14, 15, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 15, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "1", 1015, 15, 25, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_Inventory_Clerk",
                table: "Inventory",
                column: "Inventory_Clerk");

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_Product_ID",
                table: "Inventory",
                column: "Product_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Invoice_Customer_ID",
                table: "Invoice",
                column: "Customer_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Invoice_Invoice_Clerk",
                table: "Invoice",
                column: "Invoice_Clerk");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLineItems_Invoice_ID",
                table: "InvoiceLineItems",
                column: "Invoice_ID");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLineItems_Invoice_ID1",
                table: "InvoiceLineItems",
                column: "Invoice_ID1");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLineItems_Product_ID",
                table: "InvoiceLineItems",
                column: "Product_ID");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLineItems_UOM_ID",
                table: "InvoiceLineItems",
                column: "UOM_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Product_UOM_LineItem_ID",
                table: "Product_UOM",
                column: "LineItem_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Product_UOM_Parent_UOM_ID",
                table: "Product_UOM",
                column: "Parent_UOM_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Product_UOM_UOM_ID",
                table: "Product_UOM",
                column: "UOM_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Brand_ID",
                table: "Products",
                column: "Brand_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Category_ID",
                table: "Products",
                column: "Category_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Variant_ID",
                table: "Products",
                column: "Variant_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Restock_Restock_Clerk",
                table: "Restock",
                column: "Restock_Clerk");

            migrationBuilder.CreateIndex(
                name: "IX_RestockBatch_Restock_ID",
                table: "RestockBatch",
                column: "Restock_ID");

            migrationBuilder.CreateIndex(
                name: "IX_RestockBatch_Supplier_ID",
                table: "RestockBatch",
                column: "Supplier_ID");

            migrationBuilder.CreateIndex(
                name: "IX_RestockLineItems_Base_UOM_ID",
                table: "RestockLineItems",
                column: "Base_UOM_ID");

            migrationBuilder.CreateIndex(
                name: "IX_RestockLineItems_Batch_ID",
                table: "RestockLineItems",
                column: "Batch_ID");

            migrationBuilder.CreateIndex(
                name: "IX_RestockLineItems_Product_ID",
                table: "RestockLineItems",
                column: "Product_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "DeletedUsers");

            migrationBuilder.DropTable(
                name: "Inventory");

            migrationBuilder.DropTable(
                name: "InvoiceLineItems");

            migrationBuilder.DropTable(
                name: "Product_UOM");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "Invoice");

            migrationBuilder.DropTable(
                name: "RestockLineItems");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "RestockBatch");

            migrationBuilder.DropTable(
                name: "UnitOfMeasure");

            migrationBuilder.DropTable(
                name: "Brands");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Variants");

            migrationBuilder.DropTable(
                name: "Restock");

            migrationBuilder.DropTable(
                name: "AspNetUsers");
        }
    }
}
