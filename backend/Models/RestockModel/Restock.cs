
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.LineItems;

namespace backend.Models.RestockModel
{
    public class Restock
    {
        [Key]
        public int Restock_ID { get; set; } // primary key

        // FKs
        public string Restock_Clerk { get; set; } = null!; // foreign key from PersonalDetails
        public PersonalDetails Clerk { get; set; } = null!; // PersonalDetails table navigation property

        public string Restock_Number { get; set; } = null!; // unique restock number (e.g., "RS-2025-001")
        public string Restock_Notes { get; set; } = string.Empty; // restock notes
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // timestamp for creation
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // timestamp for last update

        // Navigation properties
        public ICollection<RestockBatch> RestockBatches { get; set; } = new List<RestockBatch>();
    }
}