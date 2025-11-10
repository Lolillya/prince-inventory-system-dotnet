using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FixUnitOfMeasureSeeder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 12);
        }
    }
}
