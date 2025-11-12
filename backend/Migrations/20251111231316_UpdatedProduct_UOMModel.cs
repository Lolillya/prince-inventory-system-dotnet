using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedProduct_UOMModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Batch_Id",
                table: "Product_UOM",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "Product_UOM",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_Product_UOM_Batch_Id",
                table: "Product_UOM",
                column: "Batch_Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_UOM_RestocksBatch_Batch_Id",
                table: "Product_UOM",
                column: "Batch_Id",
                principalTable: "RestocksBatch",
                principalColumn: "Batch_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Product_UOM_RestocksBatch_Batch_Id",
                table: "Product_UOM");

            migrationBuilder.DropIndex(
                name: "IX_Product_UOM_Batch_Id",
                table: "Product_UOM");

            migrationBuilder.DropColumn(
                name: "Batch_Id",
                table: "Product_UOM");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "Product_UOM");
        }
    }
}
