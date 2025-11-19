using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedInventoryModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Inventories",
                table: "Inventories");

            migrationBuilder.DropColumn(
                name: "Product_ID",
                table: "Variants");

            migrationBuilder.RenameTable(
                name: "Inventories",
                newName: "Inventory");

            migrationBuilder.RenameColumn(
                name: "Variant_ID",
                table: "Inventory",
                newName: "Product_ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Inventory",
                table: "Inventory",
                column: "Inventory_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_Product_ID",
                table: "Inventory",
                column: "Product_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventory_Products_Product_ID",
                table: "Inventory",
                column: "Product_ID",
                principalTable: "Products",
                principalColumn: "Product_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventory_Products_Product_ID",
                table: "Inventory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Inventory",
                table: "Inventory");

            migrationBuilder.DropIndex(
                name: "IX_Inventory_Product_ID",
                table: "Inventory");

            migrationBuilder.RenameTable(
                name: "Inventory",
                newName: "Inventories");

            migrationBuilder.RenameColumn(
                name: "Product_ID",
                table: "Inventories",
                newName: "Variant_ID");

            migrationBuilder.AddColumn<int>(
                name: "Product_ID",
                table: "Variants",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Inventories",
                table: "Inventories",
                column: "Inventory_ID");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 1,
                column: "Product_ID",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 2,
                column: "Product_ID",
                value: 2);

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 3,
                column: "Product_ID",
                value: 3);

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 4,
                column: "Product_ID",
                value: 4);

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 5,
                column: "Product_ID",
                value: 5);

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 6,
                column: "Product_ID",
                value: 6);

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 7,
                column: "Product_ID",
                value: 7);

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 8,
                column: "Product_ID",
                value: 8);

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 9,
                column: "Product_ID",
                value: 9);

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 10,
                column: "Product_ID",
                value: 10);

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 11,
                column: "Product_ID",
                value: 11);

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 12,
                column: "Product_ID",
                value: 12);

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 13,
                column: "Product_ID",
                value: 13);

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 14,
                column: "Product_ID",
                value: 14);

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 15,
                column: "Product_ID",
                value: 15);
        }
    }
}
