using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddVoidedByToRestock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Voided_At",
                table: "Restock",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Voided_By",
                table: "Restock",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Restock_Voided_By",
                table: "Restock",
                column: "Voided_By");

            migrationBuilder.AddForeignKey(
                name: "FK_Restock_AspNetUsers_Voided_By",
                table: "Restock",
                column: "Voided_By",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Restock_AspNetUsers_Voided_By",
                table: "Restock");

            migrationBuilder.DropIndex(
                name: "IX_Restock_Voided_By",
                table: "Restock");

            migrationBuilder.DropColumn(
                name: "Voided_At",
                table: "Restock");

            migrationBuilder.DropColumn(
                name: "Voided_By",
                table: "Restock");
        }
    }
}
