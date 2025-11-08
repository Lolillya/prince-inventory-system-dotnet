using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedUnitOfMeasure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UnitOfMeasure",
                columns: table => new
                {
                    uom_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    uom_Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnitOfMeasure", x => x.uom_ID);
                });

            migrationBuilder.CreateTable(
                name: "Product_UOM",
                columns: table => new
                {
                    Product_UOM_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Conversion_Factor = table.Column<int>(type: "int", nullable: false),
                    Parent_UOM_Id = table.Column<int>(type: "int", nullable: false),
                    Product_Id = table.Column<int>(type: "int", nullable: false),
                    UOM_Id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product_UOM", x => x.Product_UOM_Id);
                    table.ForeignKey(
                        name: "FK_Product_UOM_Products_Product_Id",
                        column: x => x.Product_Id,
                        principalTable: "Products",
                        principalColumn: "Product_ID");
                    table.ForeignKey(
                        name: "FK_Product_UOM_UnitOfMeasure_UOM_Id",
                        column: x => x.UOM_Id,
                        principalTable: "UnitOfMeasure",
                        principalColumn: "uom_ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Product_UOM_Product_Id",
                table: "Product_UOM",
                column: "Product_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Product_UOM_UOM_Id",
                table: "Product_UOM",
                column: "UOM_Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Product_UOM");

            migrationBuilder.DropTable(
                name: "UnitOfMeasure");
        }
    }
}
