using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.Users
{
    public class UserAuditLog
    {
        [Key]
        public int AuditLog_ID { get; set; }

        [Required]
        public string User_ID { get; set; } = null!;

        // Id of the admin who performed the action
        public string? AdminUserId { get; set; }

        // Snapshot of the admin's username at time of change
        public string AdminUsername { get; set; } = string.Empty;

        // USERNAME_CHANGED | PASSWORD_CHANGED
        public string Action { get; set; } = string.Empty;

        public string? OldValue { get; set; }

        public string? NewValue { get; set; }

        // Human-readable summary shown in UI
        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(User_ID))]
        public PersonalDetails User { get; set; } = null!;
    }
}
