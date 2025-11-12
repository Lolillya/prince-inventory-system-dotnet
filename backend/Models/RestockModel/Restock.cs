
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.LineItems;

namespace backend.Models.RestockModel
{
    public class Restock
    {
        [Key]
        public int Restock_ID { get; set; }

        // FKs
        public int Batch_ID { get; set; }
        public string Restock_Clerk { get; set; } = null!;


        public PersonalDetails Clerk { get; set; } = null!;

        public string Notes { get; set; } = null!;
        [Column(TypeName = "decimal(18,2)")]
        public decimal LineItems_Total { get; set; }

        public RestockBatch restockBatch { get; set; } = null!;

        [InverseProperty("Restock")]
        public ICollection<RestockLineItems> LineItems { get; set; } = new List<RestockLineItems>();
    }
}