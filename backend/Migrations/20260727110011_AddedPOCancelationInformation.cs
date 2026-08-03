using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedPOCancelationInformation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Cancellation_Reason",
                table: "PurchaseOrders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Cancelled_At",
                table: "PurchaseOrders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cancelled_By",
                table: "PurchaseOrders",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_Cancelled_By",
                table: "PurchaseOrders",
                column: "Cancelled_By");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrders_AspNetUsers_Cancelled_By",
                table: "PurchaseOrders",
                column: "Cancelled_By",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseOrders_AspNetUsers_Cancelled_By",
                table: "PurchaseOrders");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseOrders_Cancelled_By",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "Cancellation_Reason",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "Cancelled_At",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "Cancelled_By",
                table: "PurchaseOrders");
        }
    }
}
