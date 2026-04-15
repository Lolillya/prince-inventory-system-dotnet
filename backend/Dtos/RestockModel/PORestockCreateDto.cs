using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.RestockModel
{
    public class PORestockCreateDto
    {
        [Required]
        public int Purchase_Order_ID { get; set; }

        /// <summary>
        /// PARTIAL or FULLY_DELIVERED
        /// </summary>
        [Required]
        public string Delivery_Status { get; set; } = null!;

        [Required]
        public List<PORestockLineItemDto> LineItems { get; set; } = new List<PORestockLineItemDto>();

        [Required]
        public string Restock_Clerk { get; set; } = null!;

        public string Notes { get; set; } = "";
    }

    public class PORestockLineItemDto
    {
        [Required]
        public int Product_ID { get; set; }

        [Required]
        public int Preset_ID { get; set; }

        /// <summary>
        /// Quantity in the main/base unit (Level 1 of the preset). 0 means the card was removed.
        /// </summary>
        [Required]
        public int Main_Unit_Quantity { get; set; }
    }
}
