namespace backend.Dtos.UnitPreset
{
    public class CreateUnitPresetDto
    {
        public string Preset_Name { get; set; } = null!;
        public int Main_Unit_ID { get; set; }
        public List<UnitPresetLevelDto> Levels { get; set; } = new List<UnitPresetLevelDto>();
    }

    public class UnitPresetLevelDto
    {
        public int UOM_ID { get; set; }
        public int Level { get; set; }
        public int Conversion_Factor { get; set; }
    }
}
