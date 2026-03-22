using backend.Models.Inventory;
using backend.Models.Unit;

namespace backend.Dtos.RestockModel
{
    public class RestockDTO2
    {
        public Product product { get; set; } = null!;
        public Product_Unit_Preset product_Unit_Preset { get; set; } = null!;
    }
}