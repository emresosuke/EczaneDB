using System.Collections.Concurrent;

namespace EczaneManagement.Api.Helpers
{
    public class EPrescriptionData
    {
        public string PatientTc { get; set; } = string.Empty;
        public List<int> MedicineIds { get; set; } = new List<int>();
        public string DoctorName { get; set; } = string.Empty;
    }

    // Devletin merkezi sunucusunu simüle ediyoruz (Geçici RAM Veritabanı)
    public static class MedulaSimulator
    {
        // 15 Haneli Kod -> Reçete Verisi
        private static readonly ConcurrentDictionary<string, EPrescriptionData> _serverDatabase = new();

        // 1. Doktorun reçeteyi sisteme gönderip 15 haneli onay kodunu aldığı yer
        public static string CreatePrescription(EPrescriptionData data)
        {
            // 15 haneli rastgele bir sayı üret (Örn: 847563920183746)
            var random = new Random();
            string code = string.Empty;
            for (int i = 0; i < 15; i++)
            {
                code += random.Next(0, 10).ToString();
            }

            // Kodu ve veriyi eşleştirip devletin sunucusuna (RAM'e) kaydet
            _serverDatabase.TryAdd(code, data);
            
            return code;
        }

        // 2. Eczacının 15 haneli kodu girip reçeteyi devletten çektiği yer
        public static EPrescriptionData? GetPrescription(string code)
        {
            _serverDatabase.TryGetValue(code, out var data);
            return data;
        }
    }
}