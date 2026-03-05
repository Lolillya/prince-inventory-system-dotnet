using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.User
{
    public class UserFavoriteDto
    {
        public int Favorite_ID { get; set; }
        public int Product_ID { get; set; }
        public string Product_Code { get; set; } = string.Empty;
        public string Product_Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Brand_Name { get; set; } = string.Empty;
        public string Category_Name { get; set; } = string.Empty;
        public string Variant_Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
