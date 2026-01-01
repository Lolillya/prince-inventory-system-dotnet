using System;
using System.Collections.Generic;

namespace backend.Dtos.User
{
    public class EditUserResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public int RoleID { get; set; }
        public string Username { get; set; } = string.Empty;

        // For customers (RoleID = 4)
        public List<InvoiceSummaryDto>? Invoices { get; set; }

        // For suppliers (RoleID = 3)
        public List<RestockBatchSummaryDto>? RestockBatches { get; set; }
    }

    public class InvoiceSummaryDto
    {
        public int Invoice_ID { get; set; }
        public int Invoice_Number { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public decimal Total_Amount { get; set; }
        public decimal Discount { get; set; }
        public string? Status { get; set; }
        public int Term { get; set; }
    }

    public class RestockBatchSummaryDto
    {
        public int Batch_ID { get; set; }
        public int Restock_ID { get; set; }
        public int Batch_Number { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Restock_Number { get; set; } = string.Empty;
        public string Restock_Notes { get; set; } = string.Empty;
    }
}
