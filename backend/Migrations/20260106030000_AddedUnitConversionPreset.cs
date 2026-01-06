using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedUnitConversionPreset : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Unit_Presets",
                columns: table => new
                {
                    Preset_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Preset_Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Main_Unit_ID = table.Column<int>(type: "int", nullable: false),
                    Created_At = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Updated_At = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Unit_Presets", x => x.Preset_ID);
                    table.ForeignKey(
                        name: "FK_Unit_Presets_UnitOfMeasure_Main_Unit_ID",
                        column: x => x.Main_Unit_ID,
                        principalTable: "UnitOfMeasure",
                        principalColumn: "uom_ID");
                });

            migrationBuilder.CreateTable(
                name: "Product_Unit_Presets",
                columns: table => new
                {
                    Product_Preset_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Product_ID = table.Column<int>(type: "int", nullable: false),
                    Preset_ID = table.Column<int>(type: "int", nullable: false),
                    Assigned_At = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product_Unit_Presets", x => x.Product_Preset_ID);
                    table.ForeignKey(
                        name: "FK_Product_Unit_Presets_Products_Product_ID",
                        column: x => x.Product_ID,
                        principalTable: "Products",
                        principalColumn: "Product_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Product_Unit_Presets_Unit_Presets_Preset_ID",
                        column: x => x.Preset_ID,
                        principalTable: "Unit_Presets",
                        principalColumn: "Preset_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Unit_Preset_Levels",
                columns: table => new
                {
                    Level_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Preset_ID = table.Column<int>(type: "int", nullable: false),
                    UOM_ID = table.Column<int>(type: "int", nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    Conversion_Factor = table.Column<int>(type: "int", nullable: false),
                    Created_At = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Unit_Preset_Levels", x => x.Level_ID);
                    table.ForeignKey(
                        name: "FK_Unit_Preset_Levels_UnitOfMeasure_UOM_ID",
                        column: x => x.UOM_ID,
                        principalTable: "UnitOfMeasure",
                        principalColumn: "uom_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Unit_Preset_Levels_Unit_Presets_Preset_ID",
                        column: x => x.Preset_ID,
                        principalTable: "Unit_Presets",
                        principalColumn: "Preset_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Product_Unit_Presets_Preset_ID",
                table: "Product_Unit_Presets",
                column: "Preset_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Product_Unit_Presets_Product_ID",
                table: "Product_Unit_Presets",
                column: "Product_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Unit_Preset_Levels_Preset_ID",
                table: "Unit_Preset_Levels",
                column: "Preset_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Unit_Preset_Levels_UOM_ID",
                table: "Unit_Preset_Levels",
                column: "UOM_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Unit_Presets_Main_Unit_ID",
                table: "Unit_Presets",
                column: "Main_Unit_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Product_Unit_Presets");

            migrationBuilder.DropTable(
                name: "Unit_Preset_Levels");

            migrationBuilder.DropTable(
                name: "Unit_Presets");
        }
    }
}
