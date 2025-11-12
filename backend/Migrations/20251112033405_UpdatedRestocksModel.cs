using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedRestocksModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Restock_Batch_ID",
                table: "Restock",
                column: "Batch_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Restock_RestocksBatch_Batch_ID",
                table: "Restock",
                column: "Batch_ID",
                principalTable: "RestocksBatch",
                principalColumn: "Batch_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Restock_RestocksBatch_Batch_ID",
                table: "Restock");

            migrationBuilder.DropIndex(
                name: "IX_Restock_Batch_ID",
                table: "Restock");
        }
    }
}
