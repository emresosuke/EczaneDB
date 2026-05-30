using Microsoft.EntityFrameworkCore;
using EczaneManagement.Api.Data;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options
        .UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

app.UseCors("AllowReactApp");
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

app.MapControllers();

// 🚀 REPOYU ALAN KİŞİ İÇİN OTOMATİK VERİTABANI KURULUMU
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        // Eğer veritabanı yoksa oluşturur, migration'lar eksikse otomatik basar!
        context.Database.Migrate();
        Console.WriteLine("✅ Veritabanı yapısı başarıyla kontrol edildi ve güncellendi.");
    }
    catch (Exception ex)
    {
        Console.WriteLine("❌ Otomatik veritabanı kurulumunda hata oluştu: " + ex.Message);
    }
}

app.Run();