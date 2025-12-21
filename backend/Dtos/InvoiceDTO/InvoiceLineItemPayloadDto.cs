using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Numerics;
using System.Threading.Tasks;
using backend.Dtos.RestockModel;

namespace backend.Dtos.InvoiceDTO
{
    public class InvoiceLineItemPayloadDto
    {
        [Required]
        public ItemDetailDto Item { get; set; } = null!;
        [Required]
        public string Unit { get; set; } = "";
        [Required]
        public int Uom_ID { get; set; }
        [Required]
        public decimal Unit_Price { get; set; }
        [Required]
        public decimal Subtotal { get; set; }
        [Required]
        public int Unit_Quantity { get; set; }
    }
}