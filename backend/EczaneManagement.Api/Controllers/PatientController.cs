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

        // 1. GET: api/Patient?tc=12345678901 (TC No ile Hasta Sorgulama)
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

        // 2. POST: api/Patient (Sisteme Yeni Hasta Kaydetme)
        [HttpPost]
        public async Task<IActionResult> CreatePatient([FromBody] Patient newPatient)
        {
            if (newPatient == null)
            {
                return BadRequest("Geçersiz hasta verisi.");
            }

            // Aynı TC No ile daha önce kayıt yapılmış mı kontrolü
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
    }
}