using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class MovedUom_IDToInvoiceLineItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UOM_ID",
                table: "InvoiceLineItems",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLineItems_UOM_ID",
                table: "InvoiceLineItems",
                column: "UOM_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceLineItems_UnitOfMeasure_UOM_ID",
                table: "InvoiceLineItems",
                column: "UOM_ID",
                principalTable: "UnitOfMeasure",
                principalColumn: "uom_ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceLineItems_UnitOfMeasure_UOM_ID",
                table: "InvoiceLineItems");

            migrationBuilder.DropIndex(
                name: "IX_InvoiceLineItems_UOM_ID",
                table: "InvoiceLineItems");

            migrationBuilder.DropColumn(
                name: "UOM_ID",
                table: "InvoiceLineItems");
        }
    }
}
