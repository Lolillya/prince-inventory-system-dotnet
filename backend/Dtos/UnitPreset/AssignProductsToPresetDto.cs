namespace backend.Dtos.UnitPreset
{
    public class AssignProductsToPresetDto
    {
        public int Preset_ID { get; set; }
        public List<int> Product_IDs { get; set; } = new List<int>();
        public List<ProductPricingDto>? PricingData { get; set; }
    }

    public class ProductPricingDto
    {
        public int Product_ID { get; set; }
        public List<UnitPriceDto> UnitPrices { get; set; } = new List<UnitPriceDto>();
    }

    public class UnitPriceDto
    {
        public string UnitName { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}
