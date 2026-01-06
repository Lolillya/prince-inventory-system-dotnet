namespace backend.Dtos.UnitPreset
{
    public class UnitPresetResponseDto
    {
        public int Preset_ID { get; set; }
        public string Preset_Name { get; set; } = null!;
        public int Main_Unit_ID { get; set; }
        public string Main_Unit_Name { get; set; } = null!;
        public DateTime Created_At { get; set; }
        public DateTime Updated_At { get; set; }
        public List<UnitPresetLevelResponseDto> Levels { get; set; } = new List<UnitPresetLevelResponseDto>();
        public int Product_Count { get; set; }
        public List<ProductPresetDto> Products { get; set; } = new List<ProductPresetDto>();
    }

    public class UnitPresetLevelResponseDto
    {
        public int Level_ID { get; set; }
        public int UOM_ID { get; set; }
        public string UOM_Name { get; set; } = null!;
        public int Level { get; set; }
        public int Conversion_Factor { get; set; }
    }

    public class ProductPresetDto
    {
        public int Product_ID { get; set; }
        public string Product_Name { get; set; } = null!;
        public string? Brand_Name { get; set; }
        public string? Variant_Name { get; set; }
        public DateTime Assigned_At { get; set; }
    }
}
