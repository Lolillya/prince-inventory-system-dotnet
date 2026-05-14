using System;
using System.Collections.Generic;
using backend.Models.Unit;
using Microsoft.EntityFrameworkCore;

namespace backend.Data.Seeders
{
    public static class SeedUnitPreset
    {
        public static void SeedUnitPresetData(ModelBuilder modelBuilder)
        {
            var seededAt = new DateTime(2025, 01, 01, 00, 00, 00, DateTimeKind.Utc);

            // One standalone preset per unit of measure (no conversion levels)
            // uom_IDs 1–13 match SeedUnitOfMeasure:
            //  1=PIECE, 2=PAD, 3=SET, 4=BOX, 5=BUNDLE, 6=ROLL,
            //  7=GALLON, 8=PACK, 9=TUBE, 10=CARTON, 11=CASE, 12=REAM, 13=BOTTLE
            var presets = new List<Unit_Preset>
            {
                new Unit_Preset { Preset_ID = 1,  Preset_Name = "PIECE",   Preset_Code = "0001", Main_Unit_ID = 1,  Created_At = seededAt, Updated_At = seededAt },
                new Unit_Preset { Preset_ID = 2,  Preset_Name = "PAD",     Preset_Code = "0002", Main_Unit_ID = 2,  Created_At = seededAt, Updated_At = seededAt },
                new Unit_Preset { Preset_ID = 3,  Preset_Name = "SET",     Preset_Code = "0003", Main_Unit_ID = 3,  Created_At = seededAt, Updated_At = seededAt },
                new Unit_Preset { Preset_ID = 4,  Preset_Name = "BOX",     Preset_Code = "0004", Main_Unit_ID = 4,  Created_At = seededAt, Updated_At = seededAt },
                new Unit_Preset { Preset_ID = 5,  Preset_Name = "BUNDLE",  Preset_Code = "0005", Main_Unit_ID = 5,  Created_At = seededAt, Updated_At = seededAt },
                new Unit_Preset { Preset_ID = 6,  Preset_Name = "ROLL",    Preset_Code = "0006", Main_Unit_ID = 6,  Created_At = seededAt, Updated_At = seededAt },
                new Unit_Preset { Preset_ID = 7,  Preset_Name = "GALLON",  Preset_Code = "0007", Main_Unit_ID = 7,  Created_At = seededAt, Updated_At = seededAt },
                new Unit_Preset { Preset_ID = 8,  Preset_Name = "PACK",    Preset_Code = "0008", Main_Unit_ID = 8,  Created_At = seededAt, Updated_At = seededAt },
                new Unit_Preset { Preset_ID = 9,  Preset_Name = "TUBE",    Preset_Code = "0009", Main_Unit_ID = 9,  Created_At = seededAt, Updated_At = seededAt },
                new Unit_Preset { Preset_ID = 10, Preset_Name = "CARTON",  Preset_Code = "0010", Main_Unit_ID = 10, Created_At = seededAt, Updated_At = seededAt },
                new Unit_Preset { Preset_ID = 11, Preset_Name = "CASE",    Preset_Code = "0011", Main_Unit_ID = 11, Created_At = seededAt, Updated_At = seededAt },
                new Unit_Preset { Preset_ID = 12, Preset_Name = "REAM",    Preset_Code = "0012", Main_Unit_ID = 12, Created_At = seededAt, Updated_At = seededAt },
                new Unit_Preset { Preset_ID = 13, Preset_Name = "BOTTLE",  Preset_Code = "0013", Main_Unit_ID = 13, Created_At = seededAt, Updated_At = seededAt },
            };

            modelBuilder.Entity<Unit_Preset>().HasData(presets);
        }
    }
}
