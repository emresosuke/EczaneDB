using System.Collections.Concurrent;

namespace EczaneManagement.Api.Helpers
{
    public class EPrescriptionData
    {
        public string PatientTc { get; set; } = string.Empty;
        public List<int> MedicineIds { get; set; } = new List<int>();
        public string DoctorName { get; set; } = string.Empty;
    }

    public static class MedulaSimulator
    {
        private static readonly ConcurrentDictionary<string, EPrescriptionData> _serverDatabase = new();

        public static string CreatePrescription(EPrescriptionData data)
        {
            var random = new Random();
            string code = string.Empty;
            for (int i = 0; i < 15; i++)
            {
                code += random.Next(0, 10).ToString();
            }

            _serverDatabase.TryAdd(code, data);
            
            return code;
        }

        public static EPrescriptionData? GetPrescription(string code)
        {
            _serverDatabase.TryGetValue(code, out var data);
            return data;
        }
    }
}