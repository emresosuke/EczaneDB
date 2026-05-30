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
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.IdentityNumber == request.PatientTc);
                
            if (patient == null)
            {
                return NotFound("Satış iptal edildi: Sistemde bu TC numarasına ait bir hasta bulunamadı.");
            }

            var medicine = await _context.Medicines.FindAsync(request.MedicineId);
            if (medicine == null)
            {
                return NotFound("Satış iptal edildi: İlaç veritabanında bulunamadı.");
            }

            var availableStock = await _context.Stocks
                .Where(s => s.MedicineId == medicine.Id && s.Quantity > 0)
                .OrderBy(s => s.ExpirationDate)
                .FirstOrDefaultAsync();

            if (availableStock == null)
            {
                return BadRequest($"Satış iptal edildi: '{medicine.Name}' isimli ilacın stoku tükenmiştir!");
            }

            if (medicine.RequiresPrescription && !request.HasPrescription)
            {
                return BadRequest($"DİKKAT: '{medicine.Name}' reçeteye tabi bir ilaçtır. Reçetesiz satışı yasal olarak yapılamaz!");
            }

            availableStock.Quantity--;
            availableStock.UpdatedAt = DateTime.UtcNow;
            _context.Stocks.Update(availableStock);
            await _context.SaveChangesAsync();

            var totalRemainingStock = await _context.Stocks
                .Where(s => s.MedicineId == medicine.Id)
                .SumAsync(s => s.Quantity);

            var receipt = new
            {
                TransactionId = Guid.NewGuid(),
                Date = DateTime.UtcNow,
                PatientInfo = $"{patient.FirstName} {patient.LastName}",
                MedicineInfo = medicine.Name,
                TotalAmount = medicine.BasePrice,
                RemainingStock = totalRemainingStock,
                Status = "Satış İşlemi Başarıyla Onaylandı ve Stoktan Düşüldü"
            };

            return Ok(receipt);
        }
    }
}