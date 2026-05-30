using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EczaneManagement.Api.Data;
using EczaneManagement.Api.Models;

namespace EczaneManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PatientController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetAllPatients()
        {
            var patients = await _context.Patients.OrderByDescending(p => p.Id).Take(50).ToListAsync();
            return Ok(patients);
        }

        [HttpGet]
        public async Task<IActionResult> GetPatientByTc([FromQuery] string? tc)
        {
            if (string.IsNullOrEmpty(tc))
            {
                return BadRequest("Lütfen sorgulamak için bir TC Kimlik Numarası giriniz.");
            }

            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.IdentityNumber == tc);

            if (patient == null)
            {
                return NotFound("Bu TC Kimlik Numarasına ait bir hasta kaydı bulunamadı.");
            }

            return Ok(patient);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePatient([FromBody] Patient newPatient)
        {
            if (newPatient == null)
            {
                return BadRequest("Geçersiz hasta verisi.");
            }

            var exists = await _context.Patients
                .AnyAsync(p => p.IdentityNumber == newPatient.IdentityNumber);
                
            if (exists)
            {
                return BadRequest("Bu TC Kimlik Numarası ile sistemde zaten bir hasta kayıtlı.");
            }

            _context.Patients.Add(newPatient);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPatientByTc), new { tc = newPatient.IdentityNumber }, newPatient);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
            {
                return NotFound("Hasta bulunamadı.");
            }

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Hasta başarıyla silindi." });
        }
    }
}