namespace EczaneManagement.Api.Models
{
    // Bu sınıf veritabanı tablosu değil, sadece API'ye gelen istekleri karşılayan bir kalıptır (DTO)
    public class SaleRequest
    {
        public string PatientTc { get; set; } = string.Empty;
        
        public int MedicineId { get; set; }
        
        public bool HasPrescription { get; set; } // Eczacı reçeteyi fiziksel olarak gördü mü?
    }
}