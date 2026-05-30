using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EczaneManagement.Api.Data;
using EczaneManagement.Api.Models;
using EczaneManagement.Api.Helpers;

namespace EczaneManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PrescriptionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PrescriptionController(AppDbContext context)
        {
            _context = context;
        }

        // 1. ECZACI UCU: 15 haneli kodu devlete sorar ve sepeti hazırlar
        [HttpPost("FetchAndCart")]
        public async Task<IActionResult> ProcessPrescription([FromBody] string eRecepteKodu)
        {
            // Eğer gönderilen kod boşsa veya 15 hane değilse direkt reddet
            if (string.IsNullOrWhiteSpace(eRecepteKodu) || eRecepteKodu.Length != 15)
            {
                return BadRequest("Geçersiz format! e-Reçete kodu tam 15 haneli bir sayı olmalıdır.");
            }

            // 1. Medula Sunucusuna sor
            var data = MedulaSimulator.GetPrescription(eRecepteKodu);
            if (data == null) 
            {
                return NotFound("Bu koda ait bir reçete bulunamadı. Kod yanlış veya süresi dolmuş olabilir.");
            }

            // 2. Güvenlik: Reçetedeki TC numarası sistemde var mı?
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.IdentityNumber == data.PatientTc);
            if (patient == null) 
            {
                return NotFound("Reçetedeki TC numarasına ait hasta veritabanında bulunamadı.");
            }

            // 3. Veritabanında yeni bir Sepet (Cart) oluştur
            var cart = new Cart 
            { 
                PatientTc = data.PatientTc, 
                EPrescriptionCode = eRecepteKodu 
            };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            // 4. İlaç ID'lerini bul ve sepete at
            var responseItems = new List<object>();
            decimal totalAmount = 0;

            foreach (var medId in data.MedicineIds)
            {
                var medicine = await _context.Medicines.FindAsync(medId);
                if (medicine != null)
                {
                    var cartItem = new CartItem { CartId = cart.Id, MedicineId = medicine.Id, PriceAtTime = medicine.BasePrice, Quantity = 1 };
                    _context.CartItems.Add(cartItem);
                    
                    var totalStock = await _context.Stocks.Where(s => s.MedicineId == medicine.Id).SumAsync(s => s.Quantity);

                    responseItems.Add(new {
                        id = medicine.Id,
                        name = medicine.Name,
                        price = medicine.BasePrice,
                        stock = totalStock
                    });
                    totalAmount += medicine.BasePrice;
                }
            }
            await _context.SaveChangesAsync(); 

            return Ok(new {
                CartId = cart.Id,
                Doctor = data.DoctorName,
                Patient = $"{patient.FirstName} {patient.LastName}",
                PatientTc = patient.IdentityNumber,
                Items = responseItems,
                TotalAmount = totalAmount
            });
        }

        [HttpGet("GenerateMock")]
        public async Task<IActionResult> GenerateMockCode(string tc)
        {
            var medIds = await _context.Medicines
                                .Where(m => m.RequiresPrescription)
                                .Select(m => m.Id)
                                .ToListAsync();
            
            if (!medIds.Any()) 
            {
                medIds = await _context.Medicines.Select(m => m.Id).ToListAsync();
            }

            if (!medIds.Any()) return BadRequest("Sistemde hiç ilaç bulunamadı.");

            var random = new Random();
            var selectedMeds = medIds.OrderBy(x => random.Next()).Take(random.Next(1, 4)).ToList();

            var data = new EPrescriptionData
            {
                PatientTc = tc,
                MedicineIds = selectedMeds,
                DoctorName = "Uzman Dr. Mehmet Yılmaz"
            };
            
            // Reçeteyi Medula simülatörüne gönder ve 15 haneli kodu al
            string code = MedulaSimulator.CreatePrescription(data);
            
            return Ok(new { Code = code });
        }

       // 3. SEPETİ ONAYLA VE SATIŞI BİTİR (Transaction Mantığı)
        [HttpPost("Checkout/{cartId}")]
        public async Task<IActionResult> CheckoutCart(int cartId)
        {
            var cart = await _context.Carts.FirstOrDefaultAsync(c => c.Id == cartId);

            if (cart == null) return NotFound("Sepet bulunamadı.");
            if (cart.IsCompleted) return BadRequest("Bu sepetin satışı zaten onaylanmış!");

            // 🚀 KESİN ÇÖZÜM: Include kullanmak yerine sepet kalemlerini doğrudan ID ile çekiyoruz
            var cartItems = await _context.CartItems.Where(ci => ci.CartId == cartId).ToListAsync();

            if (!cartItems.Any()) return BadRequest("Bu sepetin içi boş!");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var item in cartItems)
                {
                    var medicine = await _context.Medicines.FindAsync(item.MedicineId);
                    var totalStock = await _context.Stocks.Where(s => s.MedicineId == item.MedicineId).SumAsync(s => s.Quantity);
                    
                    if (medicine == null || totalStock < item.Quantity)
                    {
                        return BadRequest($"Satış İptal: '{medicine?.Name}' adlı ilacın stoku yetersiz!");
                    }

                    // Stoku düş (FIFO mantığı ile eski tarihlilerden başlayarak)
                    var remainingToDeduct = item.Quantity;
                    var stocks = await _context.Stocks
                        .Where(s => s.MedicineId == item.MedicineId && s.Quantity > 0)
                        .OrderBy(s => s.ExpirationDate)
                        .ToListAsync();

                    foreach (var stock in stocks)
                    {
                        if (remainingToDeduct <= 0) break;

                        if (stock.Quantity >= remainingToDeduct)
                        {
                            stock.Quantity -= remainingToDeduct;
                            remainingToDeduct = 0;
                        }
                        else
                        {
                            remainingToDeduct -= stock.Quantity;
                            stock.Quantity = 0;
                        }
                        stock.UpdatedAt = DateTime.UtcNow;
                        _context.Stocks.Update(stock);
                    }
                }

                cart.IsCompleted = true;
                _context.Carts.Update(cart);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync(); 

                return Ok("✅ E-Reçete satışı başarıyla tamamlandı, stoklar güncellendi.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(); 
                return StatusCode(500, "İşlem sırasında hata oluştu: " + ex.Message);
            }
        }
    }
}