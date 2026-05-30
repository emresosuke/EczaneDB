using Microsoft.EntityFrameworkCore;
using EczaneManagement.Api.Models;

namespace EczaneManagement.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Stock> Stocks { get; set; }

        // 🚀 POSTGRESQL HARF KRİZİNİ KÖKTEN ÇÖZEN SIHIRLI DOKUNUŞ
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Veritabanındaki tüm tablo ve kolon isimlerini otomatik olarak küçük harfe zorlar!
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                // Tablo adını küçük harf yap
                var tableName = entity.GetTableName();
                if (!string.IsNullOrEmpty(tableName))
                {
                    entity.SetTableName(tableName.ToLower());
                }

                // Kolon isimlerini küçük harf yap
                foreach (var property in entity.GetProperties())
                {
                    var columnName = property.GetColumnName();
                    if (!string.IsNullOrEmpty(columnName))
                    {
                        property.SetColumnName(columnName.ToLower());
                    }
                }

                // Yabancı anahtar (Foreign Key) isimlerini küçük harf yap
                foreach (var fk in entity.GetForeignKeys())
                {
                    var constraintName = fk.GetConstraintName();
                    if (!string.IsNullOrEmpty(constraintName))
                    {
                        fk.SetConstraintName(constraintName.ToLower());
                    }
                }

                // Primary Key isimlerini küçük harf yap
                foreach (var key in entity.GetKeys())
                {
                    var keyName = key.GetName();
                    if (!string.IsNullOrEmpty(keyName))
                    {
                        key.SetName(keyName.ToLower());
                    }
                }
            }
        }
    }
}