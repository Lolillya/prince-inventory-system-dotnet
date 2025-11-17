using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedProductsTableFKTarget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceLineItems_Product_Product_ID",
                table: "InvoiceLineItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_Brands_Brand_ID",
                table: "Product");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_Categories_Category_ID",
                table: "Product");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_Variants_Variant_ID",
                table: "Product");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_UOM_Product_Product_Id",
                table: "Product_UOM");

            migrationBuilder.DropForeignKey(
                name: "FK_RestockLineItems_Product_Product_ID",
                table: "RestockLineItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Product",
                table: "Product");

            migrationBuilder.RenameTable(
                name: "Product",
                newName: "Products");

            migrationBuilder.RenameIndex(
                name: "IX_Product_Variant_ID",
                table: "Products",
                newName: "IX_Products_Variant_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Product_Category_ID",
                table: "Products",
                newName: "IX_Products_Category_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Product_Brand_ID",
                table: "Products",
                newName: "IX_Products_Brand_ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Products",
                table: "Products",
                column: "Product_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceLineItems_Products_Product_ID",
                table: "InvoiceLineItems",
                column: "Product_ID",
                principalTable: "Products",
                principalColumn: "Product_ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Product_UOM_Products_Product_Id",
                table: "Product_UOM",
                column: "Product_Id",
                principalTable: "Products",
                principalColumn: "Product_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Brands_Brand_ID",
                table: "Products",
                column: "Brand_ID",
                principalTable: "Brands",
                principalColumn: "Brand_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Categories_Category_ID",
                table: "Products",
                column: "Category_ID",
                principalTable: "Categories",
                principalColumn: "Category_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Variants_Variant_ID",
                table: "Products",
                column: "Variant_ID",
                principalTable: "Variants",
                principalColumn: "Variant_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_RestockLineItems_Products_Product_ID",
                table: "RestockLineItems",
                column: "Product_ID",
                principalTable: "Products",
                principalColumn: "Product_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceLineItems_Products_Product_ID",
                table: "InvoiceLineItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_UOM_Products_Product_Id",
                table: "Product_UOM");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Brands_Brand_ID",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Categories_Category_ID",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Variants_Variant_ID",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_RestockLineItems_Products_Product_ID",
                table: "RestockLineItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Products",
                table: "Products");

            migrationBuilder.RenameTable(
                name: "Products",
                newName: "Product");

            migrationBuilder.RenameIndex(
                name: "IX_Products_Variant_ID",
                table: "Product",
                newName: "IX_Product_Variant_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Products_Category_ID",
                table: "Product",
                newName: "IX_Product_Category_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Products_Brand_ID",
                table: "Product",
                newName: "IX_Product_Brand_ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Product",
                table: "Product",
                column: "Product_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceLineItems_Product_Product_ID",
                table: "InvoiceLineItems",
                column: "Product_ID",
                principalTable: "Product",
                principalColumn: "Product_ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Brands_Brand_ID",
                table: "Product",
                column: "Brand_ID",
                principalTable: "Brands",
                principalColumn: "Brand_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Categories_Category_ID",
                table: "Product",
                column: "Category_ID",
                principalTable: "Categories",
                principalColumn: "Category_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Variants_Variant_ID",
                table: "Product",
                column: "Variant_ID",
                principalTable: "Variants",
                principalColumn: "Variant_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_UOM_Product_Product_Id",
                table: "Product_UOM",
                column: "Product_Id",
                principalTable: "Product",
                principalColumn: "Product_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_RestockLineItems_Product_Product_ID",
                table: "RestockLineItems",
                column: "Product_ID",
                principalTable: "Product",
                principalColumn: "Product_ID");
        }
    }
}
