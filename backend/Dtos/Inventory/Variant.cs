using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.Inventory
{
    public class Variant
    {
        [Required]
        public int ProductId { get; set; }
        [Required]
        public string VariantName { get; set; }
        public string? Variant_Code { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; }
        [Required]
        public DateTime UpdatedAt { get; set; }
    }
}