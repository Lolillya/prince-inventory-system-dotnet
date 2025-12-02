using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedInventoryModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Inventory_Clerk",
                table: "Inventory",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 1,
                column: "Inventory_Clerk",
                value: "1");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 2,
                column: "Inventory_Clerk",
                value: "2");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 3,
                column: "Inventory_Clerk",
                value: "1");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 4,
                column: "Inventory_Clerk",
                value: "2");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 5,
                column: "Inventory_Clerk",
                value: "1");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 6,
                column: "Inventory_Clerk",
                value: "2");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 7,
                column: "Inventory_Clerk",
                value: "1");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 8,
                column: "Inventory_Clerk",
                value: "2");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 9,
                column: "Inventory_Clerk",
                value: "1");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 10,
                column: "Inventory_Clerk",
                value: "2");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 11,
                column: "Inventory_Clerk",
                value: "1");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 12,
                column: "Inventory_Clerk",
                value: "2");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 13,
                column: "Inventory_Clerk",
                value: "1");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 14,
                column: "Inventory_Clerk",
                value: "2");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 15,
                column: "Inventory_Clerk",
                value: "1");

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_Inventory_Clerk",
                table: "Inventory",
                column: "Inventory_Clerk");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventory_AspNetUsers_Inventory_Clerk",
                table: "Inventory",
                column: "Inventory_Clerk",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventory_AspNetUsers_Inventory_Clerk",
                table: "Inventory");

            migrationBuilder.DropIndex(
                name: "IX_Inventory_Inventory_Clerk",
                table: "Inventory");

            migrationBuilder.AlterColumn<string>(
                name: "Inventory_Clerk",
                table: "Inventory",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 1,
                column: "Inventory_Clerk",
                value: "John Smith");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 2,
                column: "Inventory_Clerk",
                value: "Sarah Johnson");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 3,
                column: "Inventory_Clerk",
                value: "Mike Davis");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 4,
                column: "Inventory_Clerk",
                value: "Lisa Wilson");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 5,
                column: "Inventory_Clerk",
                value: "Tom Brown");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 6,
                column: "Inventory_Clerk",
                value: "Emma Taylor");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 7,
                column: "Inventory_Clerk",
                value: "John Smith");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 8,
                column: "Inventory_Clerk",
                value: "Sarah Johnson");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 9,
                column: "Inventory_Clerk",
                value: "Mike Davis");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 10,
                column: "Inventory_Clerk",
                value: "Lisa Wilson");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 11,
                column: "Inventory_Clerk",
                value: "Tom Brown");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 12,
                column: "Inventory_Clerk",
                value: "Emma Taylor");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 13,
                column: "Inventory_Clerk",
                value: "John Smith");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 14,
                column: "Inventory_Clerk",
                value: "Sarah Johnson");

            migrationBuilder.UpdateData(
                table: "Inventory",
                keyColumn: "Inventory_ID",
                keyValue: 15,
                column: "Inventory_Clerk",
                value: "Mike Davis");
        }
    }
}
