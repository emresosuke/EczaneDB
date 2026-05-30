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

        [HttpGet]
        public async Task<IActionResult> GetMedicines(
    [FromQuery] string? search, 
    [FromQuery] decimal? maxPrice, 
    [FromQuery] bool? requiresPrescription)
{
    var query = _context.Medicines.AsQueryable();

    if (!string.IsNullOrEmpty(search))
    {
        string searchPattern = $"%{search}%";
        query = query.Where(m => 
            EF.Functions.ILike(m.Name, searchPattern) || 
            EF.Functions.ILike(m.Barcode, searchPattern));
    }

    if (maxPrice.HasValue)
    {
        query = query.Where(m => m.BasePrice <= maxPrice.Value);
    }

    if (requiresPrescription.HasValue)
    {
        query = query.Where(m => m.RequiresPrescription == requiresPrescription.Value);
    }

    var result = await query.Take(20).ToListAsync();

    var medicineIds = result.Select(m => m.Id).ToList();
    var stocks = await _context.Stocks
        .Where(s => medicineIds.Contains(s.MedicineId))
        .GroupBy(s => s.MedicineId)
        .Select(g => new { MedicineId = g.Key, TotalStock = g.Sum(s => s.Quantity) })
        .ToDictionaryAsync(s => s.MedicineId, s => s.TotalStock);

    foreach (var medicine in result)
    {
        medicine.StockQuantity = stocks.ContainsKey(medicine.Id) ? stocks[medicine.Id] : 0;
    }

    return Ok(result);
}

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMedicineById(int id)
        {
            var medicine = await _context.Medicines.FindAsync(id);

            if (medicine == null)
            {
                return NotFound(new { message = $"{id} numaralı ilaç sistemde bulunamadı." });
            }

            medicine.StockQuantity = await _context.Stocks
                .Where(s => s.MedicineId == id)
                .SumAsync(s => s.Quantity);

            return Ok(medicine);
        }
    }
}