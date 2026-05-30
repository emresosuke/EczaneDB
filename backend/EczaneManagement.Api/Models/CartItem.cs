using System.ComponentModel.DataAnnotations.Schema;

namespace EczaneManagement.Api.Models
{
    [Table("cart_items")]
    public class CartItem
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("cart_id")]
        public int CartId { get; set; }

        [ForeignKey("CartId")]
        public Cart? Cart { get; set; }

        [Column("medicine_id")]
        public int MedicineId { get; set; }

        [ForeignKey("MedicineId")]
        public Medicine? Medicine { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; } = 1;

        [Column("price_at_time")]
        public decimal PriceAtTime { get; set; }
    }
}
