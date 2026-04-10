using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSupplierProductPresetPrices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Supplier_Product_Preset_Prices",
                columns: table => new
                {
                    Price_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Supplier_ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Product_ID = table.Column<int>(type: "int", nullable: false),
                    Preset_ID = table.Column<int>(type: "int", nullable: false),
                    Price_Per_Unit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Created_At = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Updated_At = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Supplier_Product_Preset_Prices", x => x.Price_ID);
                    table.ForeignKey(
                        name: "FK_Supplier_Product_Preset_Prices_AspNetUsers_Supplier_ID",
                        column: x => x.Supplier_ID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Supplier_Product_Preset_Prices_Products_Product_ID",
                        column: x => x.Product_ID,
                        principalTable: "Products",
                        principalColumn: "Product_ID");
                    table.ForeignKey(
                        name: "FK_Supplier_Product_Preset_Prices_Unit_Presets_Preset_ID",
                        column: x => x.Preset_ID,
                        principalTable: "Unit_Presets",
                        principalColumn: "Preset_ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Supplier_Product_Preset_Prices_Preset_ID",
                table: "Supplier_Product_Preset_Prices",
                column: "Preset_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Supplier_Product_Preset_Prices_Product_ID",
                table: "Supplier_Product_Preset_Prices",
                column: "Product_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Supplier_Product_Preset_Prices_Supplier_ID_Product_ID_Preset_ID",
                table: "Supplier_Product_Preset_Prices",
                columns: new[] { "Supplier_ID", "Product_ID", "Preset_ID" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Supplier_Product_Preset_Prices");
        }
    }
}
