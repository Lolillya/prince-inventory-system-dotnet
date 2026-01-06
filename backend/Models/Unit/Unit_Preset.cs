using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.Unit
{
    public class Unit_Preset
    {
        [Key]
        public int Preset_ID { get; set; }

        public string Preset_Name { get; set; } = null!; // e.g., "Box-Cases-Pieces"

        public int Main_Unit_ID { get; set; } // FK to UnitOfMeasure (the base/main unit, e.g., Box)

        public DateTime Created_At { get; set; } = DateTime.UtcNow;

        public DateTime Updated_At { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public UnitOfMeasure MainUnit { get; set; } = null!;

        public ICollection<Unit_Preset_Level> PresetLevels { get; set; } = new List<Unit_Preset_Level>();

        public ICollection<Product_Unit_Preset> ProductPresets { get; set; } = new List<Product_Unit_Preset>();
    }
}