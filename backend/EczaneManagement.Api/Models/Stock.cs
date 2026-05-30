using System.ComponentModel.DataAnnotations.Schema;

namespace EczaneManagement.Api.Models
{
    [Table("stocks")]
    public class Stock
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("medicine_id")]
        public int MedicineId { get; set; }

        [Column("batch_number")]
        public string BatchNumber { get; set; } = string.Empty;

        [Column("quantity")]
        public int Quantity { get; set; }

        [Column("expiration_date")]
        public DateTime ExpirationDate { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
