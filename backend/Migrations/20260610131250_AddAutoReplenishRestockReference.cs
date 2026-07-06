using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAutoReplenishRestockReference : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Restock_Invoice_Reference",
                table: "Restock",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AutoReplenish_Restock_ID",
                table: "Invoice",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoice_AutoReplenish_Restock_ID",
                table: "Invoice",
                column: "AutoReplenish_Restock_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoice_Restock_AutoReplenish_Restock_ID",
                table: "Invoice",
                column: "AutoReplenish_Restock_ID",
                principalTable: "Restock",
                principalColumn: "Restock_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoice_Restock_AutoReplenish_Restock_ID",
                table: "Invoice");

            migrationBuilder.DropIndex(
                name: "IX_Invoice_AutoReplenish_Restock_ID",
                table: "Invoice");

            migrationBuilder.DropColumn(
                name: "Restock_Invoice_Reference",
                table: "Restock");

            migrationBuilder.DropColumn(
                name: "AutoReplenish_Restock_ID",
                table: "Invoice");
        }
    }
}
