using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedDeleteActionToNoAction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Product_Unit_Presets_Products_Product_ID",
                table: "Product_Unit_Presets");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Unit_Presets_Products_Product_ID",
                table: "Product_Unit_Presets",
                column: "Product_ID",
                principalTable: "Products",
                principalColumn: "Product_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Product_Unit_Presets_Products_Product_ID",
                table: "Product_Unit_Presets");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Unit_Presets_Products_Product_ID",
                table: "Product_Unit_Presets",
                column: "Product_ID",
                principalTable: "Products",
                principalColumn: "Product_ID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
