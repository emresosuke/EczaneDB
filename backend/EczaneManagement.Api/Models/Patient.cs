using System.ComponentModel.DataAnnotations.Schema;

namespace EczaneManagement.Api.Models
{
    [Table("patients")]
    public class Patient
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("identity_number")]
        public string IdentityNumber { get; set; } = string.Empty;

        [Column("first_name")]
        public string FirstName { get; set; } = string.Empty;

        [Column("last_name")]
        public string LastName { get; set; } = string.Empty;

        [Column("phone")]
        public string? Phone { get; set; }

        [Column("chronic_illnesses")]
        public string? ChronicIllnesses { get; set; }

        [Column("allergies")]
        public string? Allergies { get; set; }

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    }
}