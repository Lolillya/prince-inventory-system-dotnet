using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FixedRestockLineItemsModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Unit",
                table: "RestockLineItems",
                newName: "uom_ID");

            migrationBuilder.CreateIndex(
                name: "IX_RestockLineItems_uom_ID",
                table: "RestockLineItems",
                column: "uom_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_RestockLineItems_UnitOfMeasure_uom_ID",
                table: "RestockLineItems",
                column: "uom_ID",
                principalTable: "UnitOfMeasure",
                principalColumn: "uom_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RestockLineItems_UnitOfMeasure_uom_ID",
                table: "RestockLineItems");

            migrationBuilder.DropIndex(
                name: "IX_RestockLineItems_uom_ID",
                table: "RestockLineItems");

            migrationBuilder.RenameColumn(
                name: "uom_ID",
                table: "RestockLineItems",
                newName: "Unit");
        }
    }
}
