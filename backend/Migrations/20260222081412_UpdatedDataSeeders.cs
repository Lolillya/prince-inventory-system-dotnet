using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedDataSeeders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 1,
                column: "uom_Name",
                value: "PIECE");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 2,
                column: "uom_Name",
                value: "PAD");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 3,
                column: "uom_Name",
                value: "SET");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 4,
                column: "uom_Name",
                value: "BOX");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 5,
                column: "uom_Name",
                value: "BUNDLE");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 6,
                column: "uom_Name",
                value: "ROLL");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 8,
                column: "uom_Name",
                value: "PACK");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 9,
                column: "uom_Name",
                value: "TUBE");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 10,
                column: "uom_Name",
                value: "CARTON");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 12,
                column: "uom_Name",
                value: "REAM");

            migrationBuilder.InsertData(
                table: "UnitOfMeasure",
                columns: new[] { "uom_ID", "uom_Name" },
                values: new object[] { 13, "BOTTLE" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 13);

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 1,
                column: "uom_Name",
                value: "PIECES");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 2,
                column: "uom_Name",
                value: "PADS");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 3,
                column: "uom_Name",
                value: "SETS");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 4,
                column: "uom_Name",
                value: "BOXES");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 5,
                column: "uom_Name",
                value: "BUNDLES");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 6,
                column: "uom_Name",
                value: "ROLLS");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 8,
                column: "uom_Name",
                value: "PACKS");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 9,
                column: "uom_Name",
                value: "TUBES");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 10,
                column: "uom_Name",
                value: "CARTOONS");

            migrationBuilder.UpdateData(
                table: "UnitOfMeasure",
                keyColumn: "uom_ID",
                keyValue: 12,
                column: "uom_Name",
                value: "REAMS");
        }
    }
}
