namespace backend.Dtos.InvoiceDTO
{
    public class PaymentResponseDto
    {
        public int Payment_ID { get; set; }
        public int Invoice_ID { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = null!;
        public string? ReferenceNo { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = null!;
        public string CreatedByName { get; set; } = null!;
        public bool IsInvalidated { get; set; }
        public DateTime? InvalidatedAt { get; set; }
        public string? InvalidatedBy { get; set; }
        public string? InvalidatedByName { get; set; }
        public string? InvalidationReason { get; set; }
    }
}
