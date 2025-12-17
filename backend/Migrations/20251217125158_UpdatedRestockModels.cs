using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedRestockModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Product_UOM_Products_Product_Id",
                table: "Product_UOM");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_UOM_RestockBatch_Batch_Id",
                table: "Product_UOM");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_UOM_UnitOfMeasure_UOM_Id",
                table: "Product_UOM");

            migrationBuilder.DropForeignKey(
                name: "FK_RestockBatch_AspNetUsers_Supplier_ID",
                table: "RestockBatch");

            migrationBuilder.DropIndex(
                name: "IX_Product_UOM_Batch_Id",
                table: "Product_UOM");

            migrationBuilder.DropColumn(
                name: "Batch_Id",
                table: "Product_UOM");

            migrationBuilder.RenameColumn(
                name: "UOM_Id",
                table: "Product_UOM",
                newName: "UOM_ID");

            migrationBuilder.RenameColumn(
                name: "Parent_UOM_Id",
                table: "Product_UOM",
                newName: "Parent_UOM_ID");

            migrationBuilder.RenameColumn(
                name: "Product_Id",
                table: "Product_UOM",
                newName: "LineItem_ID");

            migrationBuilder.RenameColumn(
                name: "Price",
                table: "Product_UOM",
                newName: "Unit_Price");

            migrationBuilder.RenameIndex(
                name: "IX_Product_UOM_UOM_Id",
                table: "Product_UOM",
                newName: "IX_Product_UOM_UOM_ID");

            migrationBuilder.RenameIndex(
                name: "IX_Product_UOM_Product_Id",
                table: "Product_UOM",
                newName: "IX_Product_UOM_LineItem_ID");

            migrationBuilder.AddColumn<int>(
                name: "Restock_ID",
                table: "RestockBatch",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Restock",
                columns: table => new
                {
                    Restock_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Restock_Clerk = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Restock_Number = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Restock_Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Restock", x => x.Restock_ID);
                    table.ForeignKey(
                        name: "FK_Restock_AspNetUsers_Restock_Clerk",
                        column: x => x.Restock_Clerk,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RestockLineItems",
                columns: table => new
                {
                    LineItem_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Product_ID = table.Column<int>(type: "int", nullable: false),
                    Batch_ID = table.Column<int>(type: "int", nullable: false),
                    Base_UOM_ID = table.Column<int>(type: "int", nullable: false),
                    Base_Unit_Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Base_Unit_Quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RestockLineItems", x => x.LineItem_ID);
                    table.ForeignKey(
                        name: "FK_RestockLineItems_Products_Product_ID",
                        column: x => x.Product_ID,
                        principalTable: "Products",
                        principalColumn: "Product_ID");
                    table.ForeignKey(
                        name: "FK_RestockLineItems_RestockBatch_Batch_ID",
                        column: x => x.Batch_ID,
                        principalTable: "RestockBatch",
                        principalColumn: "Batch_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RestockLineItems_UnitOfMeasure_Base_UOM_ID",
                        column: x => x.Base_UOM_ID,
                        principalTable: "UnitOfMeasure",
                        principalColumn: "uom_ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_RestockBatch_Restock_ID",
                table: "RestockBatch",
                column: "Restock_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Product_UOM_Parent_UOM_ID",
                table: "Product_UOM",
                column: "Parent_UOM_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Restock_Restock_Clerk",
                table: "Restock",
                column: "Restock_Clerk");

            migrationBuilder.CreateIndex(
                name: "IX_RestockLineItems_Base_UOM_ID",
                table: "RestockLineItems",
                column: "Base_UOM_ID");

            migrationBuilder.CreateIndex(
                name: "IX_RestockLineItems_Batch_ID",
                table: "RestockLineItems",
                column: "Batch_ID");

            migrationBuilder.CreateIndex(
                name: "IX_RestockLineItems_Product_ID",
                table: "RestockLineItems",
                column: "Product_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_UOM_RestockLineItems_LineItem_ID",
                table: "Product_UOM",
                column: "LineItem_ID",
                principalTable: "RestockLineItems",
                principalColumn: "LineItem_ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Product_UOM_UnitOfMeasure_Parent_UOM_ID",
                table: "Product_UOM",
                column: "Parent_UOM_ID",
                principalTable: "UnitOfMeasure",
                principalColumn: "uom_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_UOM_UnitOfMeasure_UOM_ID",
                table: "Product_UOM",
                column: "UOM_ID",
                principalTable: "UnitOfMeasure",
                principalColumn: "uom_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_RestockBatch_AspNetUsers_Supplier_ID",
                table: "RestockBatch",
                column: "Supplier_ID",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RestockBatch_Restock_Restock_ID",
                table: "RestockBatch",
                column: "Restock_ID",
                principalTable: "Restock",
                principalColumn: "Restock_ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Product_UOM_RestockLineItems_LineItem_ID",
                table: "Product_UOM");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_UOM_UnitOfMeasure_Parent_UOM_ID",
                table: "Product_UOM");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_UOM_UnitOfMeasure_UOM_ID",
                table: "Product_UOM");

            migrationBuilder.DropForeignKey(
                name: "FK_RestockBatch_AspNetUsers_Supplier_ID",
                table: "RestockBatch");

            migrationBuilder.DropForeignKey(
                name: "FK_RestockBatch_Restock_Restock_ID",
                table: "RestockBatch");

            migrationBuilder.DropTable(
                name: "Restock");

            migrationBuilder.DropTable(
                name: "RestockLineItems");

            migrationBuilder.DropIndex(
                name: "IX_RestockBatch_Restock_ID",
                table: "RestockBatch");

            migrationBuilder.DropIndex(
                name: "IX_Product_UOM_Parent_UOM_ID",
                table: "Product_UOM");

            migrationBuilder.DropColumn(
                name: "Restock_ID",
                table: "RestockBatch");

            migrationBuilder.RenameColumn(
                name: "UOM_ID",
                table: "Product_UOM",
                newName: "UOM_Id");

            migrationBuilder.RenameColumn(
                name: "Parent_UOM_ID",
                table: "Product_UOM",
                newName: "Parent_UOM_Id");

            migrationBuilder.RenameColumn(
                name: "Unit_Price",
                table: "Product_UOM",
                newName: "Price");

            migrationBuilder.RenameColumn(
                name: "LineItem_ID",
                table: "Product_UOM",
                newName: "Product_Id");

            migrationBuilder.RenameIndex(
                name: "IX_Product_UOM_UOM_ID",
                table: "Product_UOM",
                newName: "IX_Product_UOM_UOM_Id");

            migrationBuilder.RenameIndex(
                name: "IX_Product_UOM_LineItem_ID",
                table: "Product_UOM",
                newName: "IX_Product_UOM_Product_Id");

            migrationBuilder.AddColumn<int>(
                name: "Batch_Id",
                table: "Product_UOM",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Product_UOM_Batch_Id",
                table: "Product_UOM",
                column: "Batch_Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_UOM_Products_Product_Id",
                table: "Product_UOM",
                column: "Product_Id",
                principalTable: "Products",
                principalColumn: "Product_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_UOM_RestockBatch_Batch_Id",
                table: "Product_UOM",
                column: "Batch_Id",
                principalTable: "RestockBatch",
                principalColumn: "Batch_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_UOM_UnitOfMeasure_UOM_Id",
                table: "Product_UOM",
                column: "UOM_Id",
                principalTable: "UnitOfMeasure",
                principalColumn: "uom_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_RestockBatch_AspNetUsers_Supplier_ID",
                table: "RestockBatch",
                column: "Supplier_ID",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
