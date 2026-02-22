using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace backend.Dtos.Inventory
{
    public class NewInventoryProductDto
    {
        public string ProductName { get; set; } = "";
        public string Description { get; set; } = "";
        public string ProductCode { get; set; } = "";
        public string Inventory_Clerk { get; set; } = "";
        public int Brand_Id { get; set; }
        public int Category_Id { get; set; }
        public int Variant_Id { get; set; }
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("unitPresets")]
        public List<UnitPresetAssignment>? UnitPresets { get; set; }
    }

    public class UnitPresetAssignment
    {
        [JsonPropertyName("preset_ID")]
        public int Preset_ID { get; set; }

        [JsonPropertyName("low_Stock_Level")]
        public int Low_Stock_Level { get; set; }

        [JsonPropertyName("very_Low_Stock_Level")]
        public int Very_Low_Stock_Level { get; set; }
    }
}