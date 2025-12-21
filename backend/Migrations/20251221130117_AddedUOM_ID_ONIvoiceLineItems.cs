using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedUOM_ID_ONIvoiceLineItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UOM_ID",
                table: "Invoice",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Invoice_UOM_ID",
                table: "Invoice",
                column: "UOM_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoice_UnitOfMeasure_UOM_ID",
                table: "Invoice",
                column: "UOM_ID",
                principalTable: "UnitOfMeasure",
                principalColumn: "uom_ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoice_UnitOfMeasure_UOM_ID",
                table: "Invoice");

            migrationBuilder.DropIndex(
                name: "IX_Invoice_UOM_ID",
                table: "Invoice");

            migrationBuilder.DropColumn(
                name: "UOM_ID",
                table: "Invoice");
        }
    }
}
