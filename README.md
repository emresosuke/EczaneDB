# 💊 Eczane Otomasyonu & Dinamik Yönetim Sistemi (EczaneDB)

Modern bir eczanenin günlük operasyonel ihtiyaçlarını (ilaç envanteri, hasta/CRM yönetimi, reçete kontrolü ve satış süreçleri) optimize etmek amacıyla geliştirilmiş, kurumsal standartlarda bir **Backend Web API** uygulamasıdır. Mikro ölçekli veritabanı simülasyonları ve asenkron veri işleme yetenekleriyle yüksek performanslı bir altyapı sunar.

---

## 🛠️ Kullanılan Teknolojiler (Tech Stack)

* **Backend Engine:** .NET 8 (Web API)
* **ORM (Object-Relational Mapping):** Entity Framework Core (EF Core)
* **Database:** PostgreSQL (Hosted via Docker)
* **Scripting & Data Seeding:** Python (Faker library)
* **API Documentation:** Swagger UI / OpenAPI
* **Naming Convention:** EFCore.NamingConventions (`snake_case`)

---

## 📂 Klasör Yapısı (Project Structure)

```text
EczaneDB/
├── .gitignore
├── README.md
├── database/
│   ├── seed.py             # 10.000+ satırlık yapay veri basan Python scripti
│   └── requirements.txt    # Python bağımlılıkları (Faker, psycopg2)
└── backend/
    └── EczaneManagement.Api/
        ├── Controllers/    # API Endpoint uç noktaları (Örn: MedicineController)
        ├── Data/           # DbContext ve veritabanı bağlantı katmanı
        ├── Models/         # Entity Framework veri modelleri
        ├── Program.cs      # Uygulamanın giriş kapısı ve servis yapılandırmaları
        └── appsettings.json # PostgreSQL bağlantı dizesi (Connection String)

🚀 Kurulum ve Çalıştırma Rehberi (Getting Started)
Projeyi kendi yerel bilgisayarınızda ayağa kaldırmak için sırasıyla aşağıdaki adımları takip edin:

1. Projeyi Klonlayın
```bash
git clone [https://github.com/emresosuke/EczaneDB.git](https://github.com/emresosuke/EczaneDB.git)
cd EczaneDB
2. Veritabanını Ayağa Kaldırın (Docker & PostgreSQL)
Bilgisayarınızda Docker Desktop'ın açık olduğundan emin olun ve terminalden şu komutla izole PostgreSQL konteynerini başlatın:

Bash
docker run --name eczane-postgres -e POSTGRES_PASSWORD=1234 -p 5432:5432 -d postgres
3. Veritabanını Yapay Verilerle Doldurun (Python Seeding)
Veritabanına 10.000+ gerçekçi ilaç envanteri basmak için database klasörüne gidin ve scripti çalıştırın:

Bash
cd database
pip install -r requirements.txt
python seed.py
cd ..
4. .NET Web API Uygulamasını Başlatın
Projenin backend katmanına geçiş yapın, bağımlılıkları tazeleyin ve API'yi ayağa kaldırın:

Bash
cd backend/EczaneManagement.Api
dotnet restore
dotnet build
dotnet run
🎯 API Test Alanı (Swagger)
Uygulama başarıyla çalıştıktan sonra tarayıcınızdan aşağıdaki adrese giderek entegre Swagger UI üzerinden API uçlarını (Örn: GET /api/Medicine) canlı olarak test edebilirsiniz:
👉 http://localhost:5123/swagger (Port numarası terminal çıktınıza göre değişiklik gösterebilir)

🌟 Tamamlanan Özellikler (2. Hafta)
[x] Docker üzerinde PostgreSQL veritabanı mimarisinin kurulması.

[x] Python ve Faker kütüphanesi ile ilişkisel büyük veri simülasyonunun tamamlanması.

[x] .NET 8 Web API projesinin oluşturulması ve snake_case dönüştürücü entegrasyonu.

[x] Kültür ve Türkçe karakter duyarlılığına sahip (ILike), asenkron ilaç arama motorunun kodlanması.

[x] Projenin kurumsal standartlarda GitHub'a taşınması.

Bu proje Akdeniz Üniversitesi Bilgisayar Programcılığı kapsamında geliştirilmektedir.


---

### 🚀 Adım 2: Değişikliği GitHub'a Gönderme

Dosyayı kaydedip kapattıktan sonra, bu harika vitrini GitHub'daki repona yansıtmak için VS Code terminalinden şu 3 komutu sırayla çalıştır:

```bash
git add README.md
git commit -m "docs: kurumsal readme.md dokümantasyonu eklendi"
git push