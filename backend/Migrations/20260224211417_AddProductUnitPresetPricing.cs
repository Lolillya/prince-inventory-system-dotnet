using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddProductUnitPresetPricing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Product_ID1",
                table: "Product_Unit_Presets",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Product_Unit_Preset_Pricing",
                columns: table => new
                {
                    Pricing_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Product_Preset_ID = table.Column<int>(type: "int", nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    UOM_ID = table.Column<int>(type: "int", nullable: false),
                    Price_Per_Unit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Created_At = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Updated_At = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product_Unit_Preset_Pricing", x => x.Pricing_ID);
                    table.ForeignKey(
                        name: "FK_Product_Unit_Preset_Pricing_Product_Unit_Presets_Product_Preset_ID",
                        column: x => x.Product_Preset_ID,
                        principalTable: "Product_Unit_Presets",
                        principalColumn: "Product_Preset_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Product_Unit_Preset_Pricing_UnitOfMeasure_UOM_ID",
                        column: x => x.UOM_ID,
                        principalTable: "UnitOfMeasure",
                        principalColumn: "uom_ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Product_Unit_Presets_Product_ID1",
                table: "Product_Unit_Presets",
                column: "Product_ID1");

            migrationBuilder.CreateIndex(
                name: "IX_Product_Unit_Preset_Pricing_Product_Preset_ID",
                table: "Product_Unit_Preset_Pricing",
                column: "Product_Preset_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Product_Unit_Preset_Pricing_UOM_ID",
                table: "Product_Unit_Preset_Pricing",
                column: "UOM_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Unit_Presets_Products_Product_ID1",
                table: "Product_Unit_Presets",
                column: "Product_ID1",
                principalTable: "Products",
                principalColumn: "Product_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Product_Unit_Presets_Products_Product_ID1",
                table: "Product_Unit_Presets");

            migrationBuilder.DropTable(
                name: "Product_Unit_Preset_Pricing");

            migrationBuilder.DropIndex(
                name: "IX_Product_Unit_Presets_Product_ID1",
                table: "Product_Unit_Presets");

            migrationBuilder.DropColumn(
                name: "Product_ID1",
                table: "Product_Unit_Presets");
        }
    }
}
