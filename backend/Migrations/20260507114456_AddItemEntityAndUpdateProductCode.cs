using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddItemEntityAndUpdateProductCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Item_ID",
                table: "Products",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    Item_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ItemName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Item_Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.Item_ID);
                });

            migrationBuilder.InsertData(
                table: "Items",
                columns: new[] { "Item_ID", "CreatedAt", "ItemName", "Item_Code", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Gel Pen", "001", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Ballpoint Pen", "002", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Permanent Marker", "003", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Dry Erase Marker", "004", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Pencil", "005", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Crayon", "006", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 7, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Colored Pencil", "007", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 8, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Fineliner", "008", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 9, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Notebook", "009", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 10, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Composition Book", "010", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 11, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Staple", "011", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 12, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Paper Clip", "012", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 1,
                columns: new[] { "Item_ID", "Product_Code", "Product_Name" },
                values: new object[] { 1, "001-001-0001", "Gel Pen - Pilot - Single Pack" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 2,
                columns: new[] { "Core_Product_Code", "Item_ID", "Product_Code", "Product_Name" },
                values: new object[] { "0020020002", 2, "002-002-0002", "Ballpoint Pen - Bic - 12-Pack" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 3,
                columns: new[] { "Item_ID", "Product_Code", "Product_Name" },
                values: new object[] { 1, "001-007-0003", "Gel Pen - Pentel - 3-Pack" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 4,
                columns: new[] { "Core_Product_Code", "Item_ID", "Product_Code", "Product_Name" },
                values: new object[] { "0030080004", 3, "003-008-0004", "Permanent Marker - Sharpie - 4-Pack" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 5,
                columns: new[] { "Core_Product_Code", "Item_ID", "Product_Code", "Product_Name" },
                values: new object[] { "0040090005", 4, "004-009-0005", "Dry Erase Marker - Expo - 4-Pack Assorted Colors" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 6,
                columns: new[] { "Core_Product_Code", "Item_ID", "Product_Code", "Product_Name" },
                values: new object[] { "0050150006", 5, "005-015-0006", "Pencil - Ticonderoga - 12-Pack" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 7,
                columns: new[] { "Core_Product_Code", "Item_ID", "Product_Code", "Product_Name" },
                values: new object[] { "0060100007", 6, "006-010-0007", "Crayon - Crayola - 24-Count Box" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 8,
                columns: new[] { "Core_Product_Code", "Item_ID", "Product_Code", "Product_Name" },
                values: new object[] { "0070110008", 7, "007-011-0008", "Colored Pencil - Prismacolor - 12-Count Set" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 9,
                columns: new[] { "Core_Product_Code", "Item_ID", "Product_Code", "Product_Name" },
                values: new object[] { "0080050009", 8, "008-005-0009", "Fineliner - Staedtler - 12-Count Assorted" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 10,
                columns: new[] { "Core_Product_Code", "Item_ID", "Product_Code", "Product_Name" },
                values: new object[] { "0070060010", 7, "007-006-0010", "Colored Pencil - Faber-Castell - 12-Count Set" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 11,
                columns: new[] { "Core_Product_Code", "Item_ID", "Product_Code", "Product_Name" },
                values: new object[] { "0090120011", 9, "009-012-0011", "Notebook - Moleskine - Large (5\" x 8.25\")" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 12,
                columns: new[] { "Core_Product_Code", "Item_ID", "Product_Code", "Product_Name" },
                values: new object[] { "0090130012", 9, "009-013-0012", "Notebook - Oxford - 200 Pages" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 13,
                columns: new[] { "Core_Product_Code", "Item_ID", "Product_Code", "Product_Name" },
                values: new object[] { "0100140013", 10, "010-014-0013", "Composition Book - Mead - 100 Sheets" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 14,
                columns: new[] { "Core_Product_Code", "Item_ID", "Product_Code", "Product_Name" },
                values: new object[] { "0110020014", 11, "011-002-0014", "Staple - Bic - 5000 Count Box" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 15,
                columns: new[] { "Core_Product_Code", "Item_ID", "Product_Code", "Product_Name" },
                values: new object[] { "0120020015", 12, "012-002-0015", "Paper Clip - Bic - 100 Count Mixed Sizes" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_Item_ID",
                table: "Products",
                column: "Item_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Items_Item_ID",
                table: "Products",
                column: "Item_ID",
                principalTable: "Items",
                principalColumn: "Item_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Items_Item_ID",
                table: "Products");

            migrationBuilder.DropTable(
                name: "Items");

            migrationBuilder.DropIndex(
                name: "IX_Products_Item_ID",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Item_ID",
                table: "Products");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 1,
                columns: new[] { "Product_Code", "Product_Name" },
                values: new object[] { "PILOT-G2-07-BLK", "Pilot G2 0.7 Gel Pen - Black" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 2,
                columns: new[] { "Core_Product_Code", "Product_Code", "Product_Name" },
                values: new object[] { "0010020002", "BIC-CRYSTAL-BLK", "Bic Crystal Ballpoint Pen - Black" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 3,
                columns: new[] { "Product_Code", "Product_Name" },
                values: new object[] { "PENTEL-ENERGEL-05-BLU", "Pentel EnerGel 0.5mm Gel Pen - Blue" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 4,
                columns: new[] { "Core_Product_Code", "Product_Code", "Product_Name" },
                values: new object[] { "0010080004", "SHARPIE-FINE-BLK", "Sharpie Fine Point Permanent Marker - Black" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 5,
                columns: new[] { "Core_Product_Code", "Product_Code", "Product_Name" },
                values: new object[] { "0010090005", "EXPO-DRY-ERASE-BLK", "Expo Dry Erase Marker - Black" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 6,
                columns: new[] { "Core_Product_Code", "Product_Code", "Product_Name" },
                values: new object[] { "0010150006", "TICONDEROGA-2-PENCIL", "Ticonderoga #2 Pencil" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 7,
                columns: new[] { "Core_Product_Code", "Product_Code", "Product_Name" },
                values: new object[] { "0020100007", "CRAYOLA-24-CRAYONS", "Crayola 24-Count Crayons" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 8,
                columns: new[] { "Core_Product_Code", "Product_Code", "Product_Name" },
                values: new object[] { "0020110008", "PRISMACOLOR-12-PENCILS", "Prismacolor Premier Colored Pencils - 12 Count" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 9,
                columns: new[] { "Core_Product_Code", "Product_Code", "Product_Name" },
                values: new object[] { "0020050009", "STAEDTLER-12-MARKERS", "Staedtler Triplus Fineliner - 12 Count" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 10,
                columns: new[] { "Core_Product_Code", "Product_Code", "Product_Name" },
                values: new object[] { "0020060010", "FABER-CASTELL-12-PENCILS", "Faber-Castell Colored Pencils - 12 Count" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 11,
                columns: new[] { "Core_Product_Code", "Product_Code", "Product_Name" },
                values: new object[] { "0030120011", "MOLESKINE-CLASSIC-NOTEBOOK", "Moleskine Classic Notebook - Large" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 12,
                columns: new[] { "Core_Product_Code", "Product_Code", "Product_Name" },
                values: new object[] { "0030130012", "OXFORD-SPIRAL-NOTEBOOK", "Oxford Spiral Notebook - College Ruled" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 13,
                columns: new[] { "Core_Product_Code", "Product_Code", "Product_Name" },
                values: new object[] { "0030140013", "MEAD-COMPOSITION-BOOK", "Mead Composition Book - Wide Ruled" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 14,
                columns: new[] { "Core_Product_Code", "Product_Code", "Product_Name" },
                values: new object[] { "0040020014", "STAPLES-HEAVY-DUTY", "Heavy Duty Staples - 5000 Count" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Product_ID",
                keyValue: 15,
                columns: new[] { "Core_Product_Code", "Product_Code", "Product_Name" },
                values: new object[] { "0040020015", "PAPER-CLIPS-MIXED", "Mixed Size Paper Clips - 100 Count" });
        }
    }
}
