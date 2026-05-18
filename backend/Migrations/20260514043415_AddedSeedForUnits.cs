using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedSeedForUnits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Insert each preset only if it doesn't already exist (safe for existing databases)
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT [Unit_Presets] ON;
                IF NOT EXISTS (SELECT 1 FROM [Unit_Presets] WHERE [Preset_ID] = 1)
                    INSERT INTO [Unit_Presets] ([Preset_ID],[Created_At],[Main_Unit_ID],[Preset_Code],[Preset_Name],[Updated_At]) VALUES (1,'2025-01-01T00:00:00.000Z',1,'0001','PIECE','2025-01-01T00:00:00.000Z');
                IF NOT EXISTS (SELECT 1 FROM [Unit_Presets] WHERE [Preset_ID] = 2)
                    INSERT INTO [Unit_Presets] ([Preset_ID],[Created_At],[Main_Unit_ID],[Preset_Code],[Preset_Name],[Updated_At]) VALUES (2,'2025-01-01T00:00:00.000Z',2,'0002','PAD','2025-01-01T00:00:00.000Z');
                IF NOT EXISTS (SELECT 1 FROM [Unit_Presets] WHERE [Preset_ID] = 3)
                    INSERT INTO [Unit_Presets] ([Preset_ID],[Created_At],[Main_Unit_ID],[Preset_Code],[Preset_Name],[Updated_At]) VALUES (3,'2025-01-01T00:00:00.000Z',3,'0003','SET','2025-01-01T00:00:00.000Z');
                IF NOT EXISTS (SELECT 1 FROM [Unit_Presets] WHERE [Preset_ID] = 4)
                    INSERT INTO [Unit_Presets] ([Preset_ID],[Created_At],[Main_Unit_ID],[Preset_Code],[Preset_Name],[Updated_At]) VALUES (4,'2025-01-01T00:00:00.000Z',4,'0004','BOX','2025-01-01T00:00:00.000Z');
                IF NOT EXISTS (SELECT 1 FROM [Unit_Presets] WHERE [Preset_ID] = 5)
                    INSERT INTO [Unit_Presets] ([Preset_ID],[Created_At],[Main_Unit_ID],[Preset_Code],[Preset_Name],[Updated_At]) VALUES (5,'2025-01-01T00:00:00.000Z',5,'0005','BUNDLE','2025-01-01T00:00:00.000Z');
                IF NOT EXISTS (SELECT 1 FROM [Unit_Presets] WHERE [Preset_ID] = 6)
                    INSERT INTO [Unit_Presets] ([Preset_ID],[Created_At],[Main_Unit_ID],[Preset_Code],[Preset_Name],[Updated_At]) VALUES (6,'2025-01-01T00:00:00.000Z',6,'0006','ROLL','2025-01-01T00:00:00.000Z');
                IF NOT EXISTS (SELECT 1 FROM [Unit_Presets] WHERE [Preset_ID] = 7)
                    INSERT INTO [Unit_Presets] ([Preset_ID],[Created_At],[Main_Unit_ID],[Preset_Code],[Preset_Name],[Updated_At]) VALUES (7,'2025-01-01T00:00:00.000Z',7,'0007','GALLON','2025-01-01T00:00:00.000Z');
                IF NOT EXISTS (SELECT 1 FROM [Unit_Presets] WHERE [Preset_ID] = 8)
                    INSERT INTO [Unit_Presets] ([Preset_ID],[Created_At],[Main_Unit_ID],[Preset_Code],[Preset_Name],[Updated_At]) VALUES (8,'2025-01-01T00:00:00.000Z',8,'0008','PACK','2025-01-01T00:00:00.000Z');
                IF NOT EXISTS (SELECT 1 FROM [Unit_Presets] WHERE [Preset_ID] = 9)
                    INSERT INTO [Unit_Presets] ([Preset_ID],[Created_At],[Main_Unit_ID],[Preset_Code],[Preset_Name],[Updated_At]) VALUES (9,'2025-01-01T00:00:00.000Z',9,'0009','TUBE','2025-01-01T00:00:00.000Z');
                IF NOT EXISTS (SELECT 1 FROM [Unit_Presets] WHERE [Preset_ID] = 10)
                    INSERT INTO [Unit_Presets] ([Preset_ID],[Created_At],[Main_Unit_ID],[Preset_Code],[Preset_Name],[Updated_At]) VALUES (10,'2025-01-01T00:00:00.000Z',10,'0010','CARTON','2025-01-01T00:00:00.000Z');
                IF NOT EXISTS (SELECT 1 FROM [Unit_Presets] WHERE [Preset_ID] = 11)
                    INSERT INTO [Unit_Presets] ([Preset_ID],[Created_At],[Main_Unit_ID],[Preset_Code],[Preset_Name],[Updated_At]) VALUES (11,'2025-01-01T00:00:00.000Z',11,'0011','CASE','2025-01-01T00:00:00.000Z');
                IF NOT EXISTS (SELECT 1 FROM [Unit_Presets] WHERE [Preset_ID] = 12)
                    INSERT INTO [Unit_Presets] ([Preset_ID],[Created_At],[Main_Unit_ID],[Preset_Code],[Preset_Name],[Updated_At]) VALUES (12,'2025-01-01T00:00:00.000Z',12,'0012','REAM','2025-01-01T00:00:00.000Z');
                IF NOT EXISTS (SELECT 1 FROM [Unit_Presets] WHERE [Preset_ID] = 13)
                    INSERT INTO [Unit_Presets] ([Preset_ID],[Created_At],[Main_Unit_ID],[Preset_Code],[Preset_Name],[Updated_At]) VALUES (13,'2025-01-01T00:00:00.000Z',13,'0013','BOTTLE','2025-01-01T00:00:00.000Z');
                SET IDENTITY_INSERT [Unit_Presets] OFF;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Unit_Presets",
                keyColumn: "Preset_ID",
                keyValue: 13);
        }
    }
}
