using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedProductsModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Product_ID1",
                table: "RestockLineItems",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RestockLineItems_Product_ID1",
                table: "RestockLineItems",
                column: "Product_ID1");

            migrationBuilder.AddForeignKey(
                name: "FK_RestockLineItems_Products_Product_ID1",
                table: "RestockLineItems",
                column: "Product_ID1",
                principalTable: "Products",
                principalColumn: "Product_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RestockLineItems_Products_Product_ID1",
                table: "RestockLineItems");

            migrationBuilder.DropIndex(
                name: "IX_RestockLineItems_Product_ID1",
                table: "RestockLineItems");

            migrationBuilder.DropColumn(
                name: "Product_ID1",
                table: "RestockLineItems");
        }
    }
}
