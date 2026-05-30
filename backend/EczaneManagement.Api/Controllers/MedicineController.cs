using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EczaneManagement.Api.Data;
using EczaneManagement.Api.Models;

namespace EczaneManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicineController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MedicineController(AppDbContext context)
        {
            _context = context;
        }

        // 1. DİNAMİK İLAÇ ARAMA MOTORU (Arama terimine göre filtreler)
        // GET: /api/medicine?search=parol
       [HttpGet]
[HttpGet]
public async Task<IActionResult> GetMedicines(
    [FromQuery] string? search, 
    [FromQuery] decimal? maxPrice, 
    [FromQuery] bool? requiresPrescription)
{
    var query = _context.Medicines.AsQueryable();

    // 1. İsim veya Barkoda göre arama (Büyük/Küçük harf duyarsız)
    if (!string.IsNullOrEmpty(search))
    {
        string searchPattern = $"%{search}%";
        query = query.Where(m => 
            EF.Functions.ILike(m.Name, searchPattern) || 
            EF.Functions.ILike(m.Barcode, searchPattern));
    }

    // 2. Maksimum Fiyata göre filtreleme (Örn: Sadece 150 TL altındaki ilaçlar)
    if (maxPrice.HasValue)
    {
        query = query.Where(m => m.BasePrice <= maxPrice.Value);
    }

    // 3. Reçete Durumuna göre filtreleme (Örn: Sadece reçetesiz satılanlar)
    if (requiresPrescription.HasValue)
    {
        query = query.Where(m => m.RequiresPrescription == requiresPrescription.Value);
    }

    var result = await query.Take(20).ToListAsync();
    return Ok(result);
}

        // 2. TEK BİR İLACIN DETAYINI GETİRME
        // GET: /api/medicine/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMedicineById(int id)
        {
            var medicine = await _context.Medicines.FindAsync(id);

            if (medicine == null)
            {
                return NotFound(new { message = $"{id} numaralı ilaç sistemde bulunamadı." });
            }

            return Ok(medicine);
        }
    }
}