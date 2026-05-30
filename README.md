# 💊 EczaneDB - Kapsamlı Eczane ve CRM Yönetim Sistemi

EczaneDB, modern bir eczanenin günlük operasyonel iş akışlarını (ilaç envanteri, hasta/CRM yönetimi, reçete türü kontrolü ve satış işlemleri) dijitalleştirmek ve hızlandırmak amacıyla geliştirilmiş, kurumsal mimariye sahip bir **Full-Stack Web Uygulaması** projesidir. 

Yüksek trafikli senaryolar düşünülerek asenkron (`async/await`) yapıda tasarlanmış olup, büyük veri kümelerinde bile milisaniyeler içinde yanıt verebilen dinamik bir arama motoruna sahiptir.

---

## 🌟 Temel Özellikler (Core Features)

* **🔍 Akıllı İlaç Envanteri:** Entity Framework `ILike` fonksiyonu ile Türkçe karakter ve büyük/küçük harf duyarsız (Case-Insensitive), barkod veya isme göre anında sonuç veren dinamik arama motoru.
* **👥 Hasta ve CRM Yönetimi:** TC Kimlik Numarası üzerinden hasta geçmişi sorgulama, sisteme yeni hasta kaydetme ve reçete takibi.
* **📝 Reçete ve Satış Güvenliği:** Normal, Kırmızı ve Yeşil reçeteli ilaçların (örn: psikotrop ilaçlar) satışında otomatik güvenlik/reçete kontrolü.
* **📦 Gelişmiş Stok Yönetimi (FIFO):** İlaç stokları parti (batch) bazlı tutulur. Satış sırasında son kullanma tarihi en yakın olan stoktan dinamik düşüm işlemi yapılır.
* **🧪 Büyük Veri Simülasyonu:** Python `Faker` kütüphanesi kullanılarak Türkiye standartlarına uygun üretilmiş 10.000+ satırlık yapay ilaç ve hasta verisi (Data Seeding).

---

## 🛠️ Kullanılan Teknolojiler (Tech Stack)

* **Frontend:** React, Vite
* **Backend:** .NET 8 (Web API), C#
* **ORM:** Entity Framework Core (EF Core) + `EFCore.NamingConventions` (snake_case)
* **Veritabanı:** PostgreSQL (Docker Konteyner Mimarisi)
* **Scripting:** Python 3.x (psycopg2, Faker)
* **Dokümantasyon:** Swagger UI / OpenAPI

---

## 📂 Klasör Yapısı (Project Layout)

```text
EczaneDB/
├── .gitignore
├── README.md
├── database/
│   ├── seed.py             # Veritabanını 10.000+ veriyle dolduran script
│   └── requirements.txt    # Python bağımlılıkları
├── frontend/               # React ile geliştirilmiş kullanıcı arayüzü (Vite)
└── backend/
    └── EczaneManagement.Api/
        ├── Controllers/    # Medicine, Patient ve Sales API Endpoint'leri
        ├── Data/           # DbContext ve PostgreSQL bağlantı köprüsü
        ├── Models/         # Veritabanı tablolarının C# karşılıkları (Stock eklendi)
        ├── Program.cs      # Uygulama ayağa kalkış ve servis ayarları
        └── appsettings.json # Veritabanı bağlantı dizesi
```

## 🚀 Kurulum ve Çalıştırma Rehberi

Projeyi kendi yerel ortamınızda tam kapasiteyle ayağa kaldırmak için aşağıdaki adımları sırasıyla uygulayın:

### 1. Repoyu Klonlayın

```bash
git clone https://github.com/emresosuke/EczaneDB.git
cd EczaneDB
```

### 2. Veritabanını Başlatın (Docker)

Bilgisayarınızda Docker Desktop'ın çalıştığından emin olun ve PostgreSQL konteynerini izole olarak ayağa kaldırın:

```bash
docker run --name eczane-postgres -e POSTGRES_PASSWORD=1234 -p 5432:5432 -d postgres
```

### 3. Veritabanını Tohumlayın (Data Seeding)

Boş veritabanına yapay eczane envanterini ve hasta verilerini basmak için Python scriptini çalıştırın:

```bash
cd database
pip install -r requirements.txt
python seed.py
cd ..
```

### 4. .NET API'yi Çalıştırın (Backend)

Backend klasörüne geçerek API uygulamasını başlatın:

```bash
cd backend/EczaneManagement.Api
dotnet restore
dotnet build
dotnet run
```

### 5. Kullanıcı Arayüzünü Çalıştırın (Frontend)

Yeni bir terminal açın ve React uygulamasını ayağa kaldırın:

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 API Uç Noktaları (Endpoints)

Proje ayağa kalktıktan sonra `http://localhost:5123/swagger` adresinden arayüze erişebilir veya aşağıdaki uç noktaları kullanabilirsiniz:

| Metot | Endpoint | Açıklama |
| :--- | :--- | :--- |
| **GET** | `/api/Medicine` | İsim veya barkoda göre dinamik ilaç araması yapar. |
| **GET** | `/api/Medicine/{id}` | Belirli bir ilacın tüm teknik detaylarını getirir. |
| **GET** | `/api/Patient?tc={tcNo}` | TC Kimlik No ile hastanın sistemdeki kaydını bulur. |
| **POST** | `/api/Patient` | Sisteme yeni bir hasta (CRM kaydı) ekler. |
| **POST** | `/api/Sale` | Hasta ve İlaç ID'si ile reçete kontrolü yapıp satışı tamamlar. |

---

**Geliştirici:** Yunus Emre Kaya

*Bu proje, Akdeniz Üniversitesi Bilgisayar Programcılığı bölümü çalışmaları kapsamında tam donanımlı bir backend ve frontend mimarisi kurgulamak amacıyla geliştirilmektedir.*