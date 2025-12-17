using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

        public int Batch_Number { get; set; } // restock batch number
        public DateTime CreatedAt { get; set; } // timestamp for creation
        public DateTime UpdatedAt { get; set; } // timestamp for last update
    }
}