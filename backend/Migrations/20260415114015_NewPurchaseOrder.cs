using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class NewPurchaseOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Purchase_Order_ID",
                table: "Restock",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Restock_Purchase_Order_ID",
                table: "Restock",
                column: "Purchase_Order_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Restock_PurchaseOrders_Purchase_Order_ID",
                table: "Restock",
                column: "Purchase_Order_ID",
                principalTable: "PurchaseOrders",
                principalColumn: "Purchase_Order_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Restock_PurchaseOrders_Purchase_Order_ID",
                table: "Restock");

            migrationBuilder.DropIndex(
                name: "IX_Restock_Purchase_Order_ID",
                table: "Restock");

            migrationBuilder.DropColumn(
                name: "Purchase_Order_ID",
                table: "Restock");
        }
    }
}
