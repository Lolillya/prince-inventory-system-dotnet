using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddProductUnitPresetQuantityTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Product_Unit_Preset_Quantities_UnitOfMeasure_UOM_ID",
                table: "Product_Unit_Preset_Quantities");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Unit_Preset_Quantities_UnitOfMeasure_UOM_ID",
                table: "Product_Unit_Preset_Quantities",
                column: "UOM_ID",
                principalTable: "UnitOfMeasure",
                principalColumn: "uom_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Product_Unit_Preset_Quantities_UnitOfMeasure_UOM_ID",
                table: "Product_Unit_Preset_Quantities");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Unit_Preset_Quantities_UnitOfMeasure_UOM_ID",
                table: "Product_Unit_Preset_Quantities",
                column: "UOM_ID",
                principalTable: "UnitOfMeasure",
                principalColumn: "uom_ID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
