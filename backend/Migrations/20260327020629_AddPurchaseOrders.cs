using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchaseOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PurchaseOrders",
                columns: table => new
                {
                    Purchase_Order_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Purchase_Order_Number = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Supplier_ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Purchase_Order_Clerk = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Preferred_Delivery = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseOrders", x => x.Purchase_Order_ID);
                    table.ForeignKey(
                        name: "FK_PurchaseOrders_AspNetUsers_Purchase_Order_Clerk",
                        column: x => x.Purchase_Order_Clerk,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PurchaseOrders_AspNetUsers_Supplier_ID",
                        column: x => x.Supplier_ID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PurchaseOrderLineItems",
                columns: table => new
                {
                    Purchase_Order_LineItem_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Purchase_Order_ID = table.Column<int>(type: "int", nullable: false),
                    Product_ID = table.Column<int>(type: "int", nullable: false),
                    Preset_ID = table.Column<int>(type: "int", nullable: true),
                    UOM_ID = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Unit_Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Sub_Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseOrderLineItems", x => x.Purchase_Order_LineItem_ID);
                    table.ForeignKey(
                        name: "FK_PurchaseOrderLineItems_Products_Product_ID",
                        column: x => x.Product_ID,
                        principalTable: "Products",
                        principalColumn: "Product_ID");
                    table.ForeignKey(
                        name: "FK_PurchaseOrderLineItems_PurchaseOrders_Purchase_Order_ID",
                        column: x => x.Purchase_Order_ID,
                        principalTable: "PurchaseOrders",
                        principalColumn: "Purchase_Order_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PurchaseOrderLineItems_UnitOfMeasure_UOM_ID",
                        column: x => x.UOM_ID,
                        principalTable: "UnitOfMeasure",
                        principalColumn: "uom_ID");
                    table.ForeignKey(
                        name: "FK_PurchaseOrderLineItems_Unit_Presets_Preset_ID",
                        column: x => x.Preset_ID,
                        principalTable: "Unit_Presets",
                        principalColumn: "Preset_ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrderLineItems_Preset_ID",
                table: "PurchaseOrderLineItems",
                column: "Preset_ID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrderLineItems_Product_ID",
                table: "PurchaseOrderLineItems",
                column: "Product_ID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrderLineItems_Purchase_Order_ID",
                table: "PurchaseOrderLineItems",
                column: "Purchase_Order_ID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrderLineItems_UOM_ID",
                table: "PurchaseOrderLineItems",
                column: "UOM_ID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_Purchase_Order_Clerk",
                table: "PurchaseOrders",
                column: "Purchase_Order_Clerk");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_Supplier_ID",
                table: "PurchaseOrders",
                column: "Supplier_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PurchaseOrderLineItems");

            migrationBuilder.DropTable(
                name: "PurchaseOrders");
        }
    }
}
