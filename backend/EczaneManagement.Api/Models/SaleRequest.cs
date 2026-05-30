namespace EczaneManagement.Api.Models
{
    public class SaleRequest
    {
        public string PatientTc { get; set; } = string.Empty;
        
        public int MedicineId { get; set; }
        
        public bool HasPrescription { get; set; }
    }
}