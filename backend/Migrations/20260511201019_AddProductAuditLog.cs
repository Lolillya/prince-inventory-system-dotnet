using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddProductAuditLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProductAuditLogs",
                columns: table => new
                {
                    AuditLog_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Product_ID = table.Column<int>(type: "int", nullable: false),
                    Product_Preset_ID = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FieldName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OldValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductAuditLogs", x => x.AuditLog_ID);
                    table.ForeignKey(
                        name: "FK_ProductAuditLogs_Product_Unit_Presets_Product_Preset_ID",
                        column: x => x.Product_Preset_ID,
                        principalTable: "Product_Unit_Presets",
                        principalColumn: "Product_Preset_ID");
                    table.ForeignKey(
                        name: "FK_ProductAuditLogs_Products_Product_ID",
                        column: x => x.Product_ID,
                        principalTable: "Products",
                        principalColumn: "Product_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductAuditLogs_Product_ID",
                table: "ProductAuditLogs",
                column: "Product_ID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAuditLogs_Product_Preset_ID",
                table: "ProductAuditLogs",
                column: "Product_Preset_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductAuditLogs");
        }
    }
}
