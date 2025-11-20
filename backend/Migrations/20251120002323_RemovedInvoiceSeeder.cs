using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RemovedInvoiceSeeder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Invoice",
                keyColumn: "Invoice_ID",
                keyValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Invoice",
                columns: new[] { "Invoice_ID", "CreatedAt", "Customer_ID", "Discount", "Invoice_Clerk", "Invoice_Number", "Notes", "Status", "Term", "Total_Amount", "UpdatedAt" },
                values: new object[] { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "4", 0.00m, "2", 1, "Sample Invoice Note", "Sample Invoice Status", 30, 99999.00m, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });
        }
    }
}
