using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FixDuplicateInvoice_ID : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceLineItems_Invoice_Invoice_ID",
                table: "InvoiceLineItems");

            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceLineItems_Invoice_Invoice_ID1",
                table: "InvoiceLineItems");

            migrationBuilder.DropIndex(
                name: "IX_InvoiceLineItems_Invoice_ID1",
                table: "InvoiceLineItems");

            migrationBuilder.DropColumn(
                name: "Invoice_ID1",
                table: "InvoiceLineItems");

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceLineItems_Invoice_Invoice_ID",
                table: "InvoiceLineItems",
                column: "Invoice_ID",
                principalTable: "Invoice",
                principalColumn: "Invoice_ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceLineItems_Invoice_Invoice_ID",
                table: "InvoiceLineItems");

            migrationBuilder.AddColumn<int>(
                name: "Invoice_ID1",
                table: "InvoiceLineItems",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceLineItems_Invoice_ID1",
                table: "InvoiceLineItems",
                column: "Invoice_ID1");

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceLineItems_Invoice_Invoice_ID",
                table: "InvoiceLineItems",
                column: "Invoice_ID",
                principalTable: "Invoice",
                principalColumn: "Invoice_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceLineItems_Invoice_Invoice_ID1",
                table: "InvoiceLineItems",
                column: "Invoice_ID1",
                principalTable: "Invoice",
                principalColumn: "Invoice_ID");
        }
    }
}
