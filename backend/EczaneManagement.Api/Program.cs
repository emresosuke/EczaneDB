using Microsoft.EntityFrameworkCore;
using EczaneManagement.Api.Data;
 // 👈 BU SATIRI EN TEPEYE EKLE

var builder = WebApplication.CreateBuilder(args);
// ... geri kalan kodlar
// 1. KONTROLCÜLERİ (CONTROLLERS) SİSTEME TANITIYORUZ (KRİTİK ADIM)
builder.Services.AddControllers();

// Swagger/OpenAPI altyapısını aktif ediyoruz
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// PostgreSQL bağlantısını uygulamaya kaydediyoruz
// PostgreSQL bağlantısını alt tire ve küçük harf standardıyla (snake_case) kaydediyoruz
builder.Services.AddDbContext<AppDbContext>(options =>
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))); // Eğer EFCore.NamingConventions paketini eklemek isterseniz, UseSnakeCaseNamingConvention() kullanılabilir

var app = builder.Build();

// 2. SWAGGER ARAYÜZÜNÜN ÇALIŞMASINI SAĞLIYORUZ
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

// 3. KONTROLCÜ ROTALARINI AKTİF EDİYORUZ (KRİTİK ADIM)
app.MapControllers();

app.Run();