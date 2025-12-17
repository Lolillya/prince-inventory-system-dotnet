using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class TemporaryRemovedRestocksModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Product_UOM_RestocksBatch_Batch_Id",
                table: "Product_UOM");

            migrationBuilder.DropForeignKey(
                name: "FK_RestocksBatch_AspNetUsers_Supplier_ID",
                table: "RestocksBatch");

            migrationBuilder.DropTable(
                name: "RestockLineItems");

            migrationBuilder.DropTable(
                name: "Restock");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RestocksBatch",
                table: "RestocksBatch");

            migrationBuilder.RenameTable(
                name: "RestocksBatch",
                newName: "RestockBatch");

            migrationBuilder.RenameIndex(
                name: "IX_RestocksBatch_Supplier_ID",
                table: "RestockBatch",
                newName: "IX_RestockBatch_Supplier_ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RestockBatch",
                table: "RestockBatch",
                column: "Batch_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_UOM_RestockBatch_Batch_Id",
                table: "Product_UOM",
                column: "Batch_Id",
                principalTable: "RestockBatch",
                principalColumn: "Batch_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_RestockBatch_AspNetUsers_Supplier_ID",
                table: "RestockBatch",
                column: "Supplier_ID",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Product_UOM_RestockBatch_Batch_Id",
                table: "Product_UOM");

            migrationBuilder.DropForeignKey(
                name: "FK_RestockBatch_AspNetUsers_Supplier_ID",
                table: "RestockBatch");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RestockBatch",
                table: "RestockBatch");

            migrationBuilder.RenameTable(
                name: "RestockBatch",
                newName: "RestocksBatch");

            migrationBuilder.RenameIndex(
                name: "IX_RestockBatch_Supplier_ID",
                table: "RestocksBatch",
                newName: "IX_RestocksBatch_Supplier_ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RestocksBatch",
                table: "RestocksBatch",
                column: "Batch_ID");

            migrationBuilder.CreateTable(
                name: "Restock",
                columns: table => new
                {
                    Restock_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Batch_ID = table.Column<int>(type: "int", nullable: false),
                    Restock_Clerk = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LineItems_Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Restock", x => x.Restock_ID);
                    table.ForeignKey(
                        name: "FK_Restock_AspNetUsers_Restock_Clerk",
                        column: x => x.Restock_Clerk,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Restock_RestocksBatch_Batch_ID",
                        column: x => x.Batch_ID,
                        principalTable: "RestocksBatch",
                        principalColumn: "Batch_ID");
                });

            migrationBuilder.CreateTable(
                name: "RestockLineItems",
                columns: table => new
                {
                    LineItem_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Product_ID = table.Column<int>(type: "int", nullable: false),
                    Restock_ID = table.Column<int>(type: "int", nullable: false),
                    uom_ID = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Sub_Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Unit_Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
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
                        name: "FK_RestockLineItems_Restock_Restock_ID",
                        column: x => x.Restock_ID,
                        principalTable: "Restock",
                        principalColumn: "Restock_ID");
                    table.ForeignKey(
                        name: "FK_RestockLineItems_UnitOfMeasure_uom_ID",
                        column: x => x.uom_ID,
                        principalTable: "UnitOfMeasure",
                        principalColumn: "uom_ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Restock_Batch_ID",
                table: "Restock",
                column: "Batch_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Restock_Restock_Clerk",
                table: "Restock",
                column: "Restock_Clerk");

            migrationBuilder.CreateIndex(
                name: "IX_RestockLineItems_Product_ID",
                table: "RestockLineItems",
                column: "Product_ID");

            migrationBuilder.CreateIndex(
                name: "IX_RestockLineItems_Restock_ID",
                table: "RestockLineItems",
                column: "Restock_ID");

            migrationBuilder.CreateIndex(
                name: "IX_RestockLineItems_uom_ID",
                table: "RestockLineItems",
                column: "uom_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_UOM_RestocksBatch_Batch_Id",
                table: "Product_UOM",
                column: "Batch_Id",
                principalTable: "RestocksBatch",
                principalColumn: "Batch_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_RestocksBatch_AspNetUsers_Supplier_ID",
                table: "RestocksBatch",
                column: "Supplier_ID",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
