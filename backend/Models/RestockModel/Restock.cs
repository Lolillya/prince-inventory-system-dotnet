
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

        public string Restock_Notes { get; set; } = null!; // restock notes

    }
}