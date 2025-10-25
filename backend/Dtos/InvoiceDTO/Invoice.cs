using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.InvoiceDTO
{
    public class InvoiceDTO
    {
        [Required]
        public List<InvoiceLineItemPayloadDto> LineItem { get; set; } = new List<InvoiceLineItemPayloadDto>();
        [Required]
        public string Invoice_Clerk { get; set; } = "";
        [Required]
        public string Customer_ID { get; set; } = "";
        [Required]
        public string Notes { get; set; } = "";
        [Required]
        public int Term { get; set; }



    }
}