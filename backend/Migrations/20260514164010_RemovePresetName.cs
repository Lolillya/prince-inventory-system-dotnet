using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RemovePresetName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Preset_Name",
                table: "Unit_Presets");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Preset_Name",
                table: "Unit_Presets",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 1,
                column: "Preset_Name",
                value: "PIECE");

            migrationBuilder.UpdateData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 2,
                column: "Preset_Name",
                value: "PAD");

            migrationBuilder.UpdateData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 3,
                column: "Preset_Name",
                value: "SET");

            migrationBuilder.UpdateData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 4,
                column: "Preset_Name",
                value: "BOX");

            migrationBuilder.UpdateData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 5,
                column: "Preset_Name",
                value: "BUNDLE");

            migrationBuilder.UpdateData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 6,
                column: "Preset_Name",
                value: "ROLL");

            migrationBuilder.UpdateData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 7,
                column: "Preset_Name",
                value: "GALLON");

            migrationBuilder.UpdateData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 8,
                column: "Preset_Name",
                value: "PACK");

            migrationBuilder.UpdateData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 9,
                column: "Preset_Name",
                value: "TUBE");

            migrationBuilder.UpdateData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 10,
                column: "Preset_Name",
                value: "CARTON");

            migrationBuilder.UpdateData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 11,
                column: "Preset_Name",
                value: "CASE");

            migrationBuilder.UpdateData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 12,
                column: "Preset_Name",
                value: "REAM");

            migrationBuilder.UpdateData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 13,
                column: "Preset_Name",
                value: "BOTTLE");
        }
    }
}
