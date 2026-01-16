using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedRestocksLineItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RestockLineItems_Products_Product_ID1",
                table: "RestockLineItems");

            migrationBuilder.RenameColumn(
                name: "Product_ID1",
                table: "RestockLineItems",
                newName: "Preset_ID");

            migrationBuilder.RenameIndex(
                name: "IX_RestockLineItems_Product_ID1",
                table: "RestockLineItems",
                newName: "IX_RestockLineItems_Preset_ID");

            migrationBuilder.CreateTable(
                name: "RestockLineItem_PresetPricing",
                columns: table => new
                {
                    Pricing_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LineItem_ID = table.Column<int>(type: "int", nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    UOM_ID = table.Column<int>(type: "int", nullable: false),
                    Price_Per_Unit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Created_At = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RestockLineItem_PresetPricing", x => x.Pricing_ID);
                    table.ForeignKey(
                        name: "FK_RestockLineItem_PresetPricing_RestockLineItems_LineItem_ID",
                        column: x => x.LineItem_ID,
                        principalTable: "RestockLineItems",
                        principalColumn: "LineItem_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RestockLineItem_PresetPricing_UnitOfMeasure_UOM_ID",
                        column: x => x.UOM_ID,
                        principalTable: "UnitOfMeasure",
                        principalColumn: "uom_ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_RestockLineItem_PresetPricing_LineItem_ID",
                table: "RestockLineItem_PresetPricing",
                column: "LineItem_ID");

            migrationBuilder.CreateIndex(
                name: "IX_RestockLineItem_PresetPricing_UOM_ID",
                table: "RestockLineItem_PresetPricing",
                column: "UOM_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_RestockLineItems_Unit_Presets_Preset_ID",
                table: "RestockLineItems",
                column: "Preset_ID",
                principalTable: "Unit_Presets",
                principalColumn: "Preset_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RestockLineItems_Unit_Presets_Preset_ID",
                table: "RestockLineItems");

            migrationBuilder.DropTable(
                name: "RestockLineItem_PresetPricing");

            migrationBuilder.RenameColumn(
                name: "Preset_ID",
                table: "RestockLineItems",
                newName: "Product_ID1");

            migrationBuilder.RenameIndex(
                name: "IX_RestockLineItems_Preset_ID",
                table: "RestockLineItems",
                newName: "IX_RestockLineItems_Product_ID1");

            migrationBuilder.AddForeignKey(
                name: "FK_RestockLineItems_Products_Product_ID1",
                table: "RestockLineItems",
                column: "Product_ID1",
                principalTable: "Products",
                principalColumn: "Product_ID");
        }
    }
}
