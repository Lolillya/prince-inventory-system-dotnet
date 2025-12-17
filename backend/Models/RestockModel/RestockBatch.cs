using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.LineItems;

namespace backend.Models.RestockModel
{
    public class RestockBatch
    {
        [Key]
        public int Batch_ID { get; set; } // primary key

        // FKs
        public int Restock_ID { get; set; } // foreign key from Restock
        public string Supplier_ID { get; set; } = null!; // foreign key from PersonalDetails
        public Restock Restock { get; set; } = null!; // Restock table navigation property
        public PersonalDetails Supplier { get; set; } = null!; // PersonalDetails table navigation property

        public int Batch_Number { get; set; } // restock batch number (e.g., 1, 2, 3 for same restock from different suppliers)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // timestamp for creation
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // timestamp for last update

        // Navigation properties
        public ICollection<RestockLineItems> RestockLineItems { get; set; } = new List<RestockLineItems>();
    }
}