namespace backend.Dtos.UnitPreset
{
    public class AssignProductsToPresetDto
    {
        public int Preset_ID { get; set; }
        public List<int> Product_IDs { get; set; } = new List<int>();
    }
}
