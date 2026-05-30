using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EczaneManagement.Api.Data;
using EczaneManagement.Api.Models;

namespace EczaneManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SalesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> ProcessSale([FromBody] SaleRequest request)
        {
            // 1. Gelen TC numarası ile hastayı bul
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.IdentityNumber == request.PatientTc);
                
            if (patient == null)
            {
                return NotFound("Satış iptal edildi: Sistemde bu TC numarasına ait bir hasta bulunamadı. Lütfen önce hasta kaydını yapın.");
            }

            // 2. Gelen ID ile ilacı bul
            var medicine = await _context.Medicines.FindAsync(request.MedicineId);
            
            if (medicine == null)
            {
                return NotFound("Satış iptal edildi: İlaç veritabanında bulunamadı.");
            }

            // 3. KRİTİK NOKTA: Reçete Güvenlik Algoritması
            // Eğer ilaç veritabanında "Reçete Gerektirir" (RequiresPrescription) olarak işaretliyse 
            // ve eczacı arayüzden "Reçetesi Yok" (HasPrescription = false) olarak gönderdiyse satışı blokla!
            if (medicine.RequiresPrescription && !request.HasPrescription)
            {
                return BadRequest($"DİKKAT: '{medicine.Name}' reçeteye tabi bir ilaçtır. Reçetesiz satışı yasal olarak yapılamaz!");
            }

            // Tüm kontroller geçildiyse satışı onayla ve sanal bir dijital fiş (Receipt) oluştur
            var receipt = new
            {
                TransactionId = Guid.NewGuid(), // Benzersiz bir takip numarası
                Date = DateTime.UtcNow,
                PatientInfo = $"{patient.FirstName} {patient.LastName} ({patient.IdentityNumber})",
                MedicineInfo = medicine.Name,
                TotalAmount = medicine.BasePrice,
                Status = "Satış İşlemi Başarıyla Onaylandı"
            };

            return Ok(receipt);
        }
    }
}