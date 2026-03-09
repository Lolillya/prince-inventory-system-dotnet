using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedUnitQuantity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Main_Unit_Quantity",
                table: "Product_Unit_Presets",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Product_Unit_Preset_Quantities",
                columns: table => new
                {
                    Quantity_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Product_Preset_ID = table.Column<int>(type: "int", nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    UOM_ID = table.Column<int>(type: "int", nullable: false),
                    Original_Quantity = table.Column<int>(type: "int", nullable: false),
                    Remaining_Quantity = table.Column<int>(type: "int", nullable: false),
                    Created_At = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Updated_At = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product_Unit_Preset_Quantities", x => x.Quantity_ID);
                    table.ForeignKey(
                        name: "FK_Product_Unit_Preset_Quantities_Product_Unit_Presets_Product_Preset_ID",
                        column: x => x.Product_Preset_ID,
                        principalTable: "Product_Unit_Presets",
                        principalColumn: "Product_Preset_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Product_Unit_Preset_Quantities_UnitOfMeasure_UOM_ID",
                        column: x => x.UOM_ID,
                        principalTable: "UnitOfMeasure",
                        principalColumn: "uom_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Product_Unit_Preset_Quantities_Product_Preset_ID",
                table: "Product_Unit_Preset_Quantities",
                column: "Product_Preset_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Product_Unit_Preset_Quantities_UOM_ID",
                table: "Product_Unit_Preset_Quantities",
                column: "UOM_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Product_Unit_Preset_Quantities");

            migrationBuilder.DropColumn(
                name: "Main_Unit_Quantity",
                table: "Product_Unit_Presets");
        }
    }
}
