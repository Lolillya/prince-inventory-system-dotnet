using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Unit
{
    public class Unit_Preset_Level
    {
        [Key]
        public int Level_ID { get; set; }

        public int Preset_ID { get; set; } // FK to Unit_Preset

        public int UOM_ID { get; set; } // FK to UnitOfMeasure

        public int Level { get; set; } // 1 = main/base unit (Box), 2 = next level (Cases), etc.

        public int Conversion_Factor { get; set; } // How many of the next lower unit this equals
                                                   // e.g., 1 Box = 10 Cases, so Conversion_Factor = 10

        public DateTime Created_At { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("Preset_ID")]
        public Unit_Preset Preset { get; set; } = null!;

        [ForeignKey("UOM_ID")]
        public UnitOfMeasure UnitOfMeasure { get; set; } = null!;
    }
}
