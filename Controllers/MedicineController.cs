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
public async Task<IActionResult> GetMedicines([FromQuery] string? search)
{
    var query = _context.Medicines.AsQueryable();

    if (!string.IsNullOrEmpty(search))
    {
        // PostgreSQL için ILike (Case-Insensitive Like) işlevini EF.Functions ile kullanıyoruz
        string searchPattern = $"%{search}%";
        
        query = query.Where(m => 
            EF.Functions.ILike(m.Name, searchPattern) || 
            EF.Functions.ILike(m.Barcode, searchPattern));
    }

    var result = await query.Take(10).ToListAsync();
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