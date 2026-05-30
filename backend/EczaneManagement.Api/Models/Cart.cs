using System.ComponentModel.DataAnnotations.Schema;

namespace EczaneManagement.Api.Models
{
    [Table("carts")]
    public class Cart
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("patient_tc")]
        public string PatientTc { get; set; } = string.Empty;

        [Column("e_prescription_code")]
        public string? EPrescriptionCode { get; set; }

        [Column("is_completed")]
        public bool IsCompleted { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<CartItem> Items { get; set; } = new List<CartItem>();
    }
}