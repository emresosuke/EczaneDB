using System.ComponentModel.DataAnnotations.Schema;

namespace EczaneManagement.Api.Models
{
    [Table("medicines")]
    public class Medicine
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("barcode")]
        public string Barcode { get; set; } = string.Empty;

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("producer_company")]
        public string ProducerCompany { get; set; } = string.Empty;

        [Column("rec_type")]
        public string RecType { get; set; } = string.Empty;

        [Column("base_price")]
        public decimal BasePrice { get; set; }

        [Column("requires_prescription")]
        public bool RequiresPrescription { get; set; }
    }
}
