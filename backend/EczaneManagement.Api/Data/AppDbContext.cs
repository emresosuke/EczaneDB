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
        public DbSet<Stock> Stocks { get; set; }
    }
}
