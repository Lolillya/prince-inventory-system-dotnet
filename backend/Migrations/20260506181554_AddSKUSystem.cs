using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSKUSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Variant_Code",
                table: "Variants",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Preset_Code",
                table: "Unit_Presets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Core_Product_Code",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SKU",
                table: "Product_Unit_Presets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Category_Code",
                table: "Categories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Brand_Code",
                table: "Brands",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Brands",
                keyColumn: "Brand_ID",
                keyValue: 1,
                column: "Brand_Code",
                value: "001");

            migrationBuilder.UpdateData(
                table: "Brands",
                keyColumn: "Brand_ID",
                keyValue: 2,
                column: "Brand_Code",
                value: "002");

            migrationBuilder.UpdateData(
                table: "Brands",
                keyColumn: "Brand_ID",
                keyValue: 3,
                column: "Brand_Code",
                value: "003");

            migrationBuilder.UpdateData(
                table: "Brands",
                keyColumn: "Brand_ID",
                keyValue: 4,
                column: "Brand_Code",
                value: "004");

            migrationBuilder.UpdateData(
                table: "Brands",
                keyColumn: "Brand_ID",
                keyValue: 5,
                column: "Brand_Code",
                value: "005");

            migrationBuilder.UpdateData(
                table: "Brands",
                keyColumn: "Brand_ID",
                keyValue: 6,
                column: "Brand_Code",
                value: "006");

            migrationBuilder.UpdateData(
                table: "Brands",
                keyColumn: "Brand_ID",
                keyValue: 7,
                column: "Brand_Code",
                value: "007");

            migrationBuilder.UpdateData(
                table: "Brands",
                keyColumn: "Brand_ID",
                keyValue: 8,
                column: "Brand_Code",
                value: "008");

            migrationBuilder.UpdateData(
                table: "Brands",
                keyColumn: "Brand_ID",
                keyValue: 9,
                column: "Brand_Code",
                value: "009");

            migrationBuilder.UpdateData(
                table: "Brands",
                keyColumn: "Brand_ID",
                keyValue: 10,
                column: "Brand_Code",
                value: "010");

            migrationBuilder.UpdateData(
                table: "Brands",
                keyColumn: "Brand_ID",
                keyValue: 11,
                column: "Brand_Code",
                value: "011");

            migrationBuilder.UpdateData(
                table: "Brands",
                keyColumn: "Brand_ID",
                keyValue: 12,
                column: "Brand_Code",
                value: "012");

            migrationBuilder.UpdateData(
                table: "Brands",
                keyColumn: "Brand_ID",
                keyValue: 13,
                column: "Brand_Code",
                value: "013");

            migrationBuilder.UpdateData(
                table: "Brands",
                keyColumn: "Brand_ID",
                keyValue: 14,
                column: "Brand_Code",
                value: "014");

            migrationBuilder.UpdateData(
                table: "Brands",
                keyColumn: "Brand_ID",
                keyValue: 15,
                column: "Brand_Code",
                value: "015");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Category_ID",
                keyValue: 1,
                column: "Category_Code",
                value: "001");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Category_ID",
                keyValue: 2,
                column: "Category_Code",
                value: "002");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Category_ID",
                keyValue: 3,
                column: "Category_Code",
                value: "003");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Category_ID",
                keyValue: 4,
                column: "Category_Code",
                value: "004");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Category_ID",
                keyValue: 5,
                column: "Category_Code",
                value: "005");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Category_ID",
                keyValue: 6,
                column: "Category_Code",
                value: "006");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Category_ID",
                keyValue: 7,
                column: "Category_Code",
                value: "007");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Category_ID",
                keyValue: 8,
                column: "Category_Code",
                value: "008");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 1,
                column: "Core_Product_Code",
                value: "0010010001");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 2,
                column: "Core_Product_Code",
                value: "0010020002");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 3,
                column: "Core_Product_Code",
                value: "0010070003");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 4,
                column: "Core_Product_Code",
                value: "0010080004");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 5,
                column: "Core_Product_Code",
                value: "0010090005");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 6,
                column: "Core_Product_Code",
                value: "0010150006");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 7,
                column: "Core_Product_Code",
                value: "0020100007");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 8,
                column: "Core_Product_Code",
                value: "0020110008");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 9,
                column: "Core_Product_Code",
                value: "0020050009");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 10,
                column: "Core_Product_Code",
                value: "0020060010");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 11,
                column: "Core_Product_Code",
                value: "0030120011");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 12,
                column: "Core_Product_Code",
                value: "0030130012");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 13,
                column: "Core_Product_Code",
                value: "0030140013");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 14,
                column: "Core_Product_Code",
                value: "0040020014");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 15,
                column: "Core_Product_Code",
                value: "0040020015");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 1,
                column: "Variant_Code",
                value: "0001");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 2,
                column: "Variant_Code",
                value: "0002");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 3,
                column: "Variant_Code",
                value: "0003");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 4,
                column: "Variant_Code",
                value: "0004");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 5,
                column: "Variant_Code",
                value: "0005");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 6,
                column: "Variant_Code",
                value: "0006");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 7,
                column: "Variant_Code",
                value: "0007");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 8,
                column: "Variant_Code",
                value: "0008");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 9,
                column: "Variant_Code",
                value: "0009");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 10,
                column: "Variant_Code",
                value: "0010");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 11,
                column: "Variant_Code",
                value: "0011");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 12,
                column: "Variant_Code",
                value: "0012");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 13,
                column: "Variant_Code",
                value: "0013");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 14,
                column: "Variant_Code",
                value: "0014");

            migrationBuilder.UpdateData(
                table: "Variants",
                keyColumn: "Variant_ID",
                keyValue: 15,
                column: "Variant_Code",
                value: "0015");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Variant_Code",
                table: "Variants");

            migrationBuilder.DropColumn(
                name: "Preset_Code",
                table: "Unit_Presets");

            migrationBuilder.DropColumn(
                name: "Core_Product_Code",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "SKU",
                table: "Product_Unit_Presets");

            migrationBuilder.DropColumn(
                name: "Category_Code",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "Brand_Code",
                table: "Brands");
        }
    }
}
