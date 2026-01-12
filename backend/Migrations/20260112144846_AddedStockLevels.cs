using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedStockLevels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Low_Stock_Level",
                table: "Product_Unit_Presets",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Very_Low_Stock_Level",
                table: "Product_Unit_Presets",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Low_Stock_Level",
                table: "Product_Unit_Presets");

            migrationBuilder.DropColumn(
                name: "Very_Low_Stock_Level",
                table: "Product_Unit_Presets");
        }
    }
}
