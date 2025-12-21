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
        public string CreatedAt { get; set; } = "";
        public string UpdatedAt { get; set; } = "";
        [Required]
        public int Product_ID { get; set; }


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
        [Required]
        public int Discount { get; set; }
        [Required]
        public bool isPercentageDiscount { get; set; }
    }
}