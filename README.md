# 💊 EczaneDB - Kapsamlı Eczane ve CRM Yönetim Sistemi

EczaneDB, modern bir eczanenin günlük operasyonel iş akışlarını (ilaç envanteri, hasta/CRM yönetimi, e-Reçete entegrasyonu ve satış işlemleri) dijitalleştirmek ve hızlandırmak amacıyla geliştirilmiş, kurumsal mimariye sahip bir **Full-Stack Web Uygulaması** projesidir.

Yüksek trafikli senaryolar düşünülerek asenkron (`async/await`) yapıda tasarlanmış olup, büyük veri kümelerinde bile milisaniyeler içinde yanıt verebilen dinamik bir arama motoruna sahiptir.

---

## 🌟 Temel Özellikler (Core Features)

* **🔍 Akıllı İlaç Envanteri:** Entity Framework `ILike` fonksiyonu ile Türkçe karakter ve büyük/küçük harf duyarsız (Case-Insensitive), barkod veya isme göre anında sonuç veren dinamik arama motoru.
* **👥 Hasta ve CRM Yönetimi:** TC Kimlik Numarası üzerinden hasta geçmişi sorgulama, sisteme yeni hasta kaydetme ve reçete takibi.
* **📝 E-Reçete Entegrasyonu ve Kriptografi:** Şifrelenmiş (Base64/JSON) 15 haneli e-Reçete kodlarını okuma, hastanın reçetedeki ilaçlarını otomatik olarak Medula simülatöründen çekme ve sepete aktarma.
* **🛒 Sepet (Cart) Mantığı:** Reçeteden gelen ilaçların tek bir işlemde (Transaction) sepet üzerinden satılması.
* **📦 Gelişmiş Stok Yönetimi (FIFO):** İlaç stokları parti (batch) bazlı tutulur. Satış sırasında son kullanma tarihi en yakın olan stoktan (İlk Giren İlk Çıkar mantığı ile) dinamik düşüm işlemi yapılır.
* **🧪 Büyük Veri Simülasyonu:** Python `Faker` kütüphanesi kullanılarak Türkiye standartlarına uygun üretilmiş 10.000+ satırlık yapay ilaç ve hasta verisi (Data Seeding).

---

## 🛠️ Kullanılan Teknolojiler (Tech Stack)

* **Frontend:** React, Vite, React Router DOM
* **Backend:** .NET 8 (Web API), C#
* **ORM:** Entity Framework Core (EF Core) + `EFCore.NamingConventions` (snake_case)
* **Veritabanı:** PostgreSQL (Docker Konteyner Mimarisi)
* **Scripting:** Python 3.x (psycopg2, Faker)
* **Güvenlik / Kriptoloji:** Base64 Encoding, JSON Serialization (CryptoHelper)

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
        ├── Controllers/    # Medicine, Patient, Sales ve Prescription Endpoint'leri
        ├── Data/           # DbContext ve PostgreSQL bağlantı köprüsü
        ├── Helpers/        # Kriptografi (CryptoHelper) ve Medula Simülatörü
        ├── Models/         # Medicine, Patient, Stock, Cart, CartItem modelleri
        ├── Program.cs      # Uygulama ayağa kalkış ve servis ayarları
        └── appsettings.json # Veritabanı bağlantı dizesi
```

---

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
dotnet ef database update  # Gerekirse Entity Framework migration'larını uygular
dotnet run
```
*Not: Backend varsayılan olarak `http://localhost:5034` üzerinden hizmet verir.*

### 5. Kullanıcı Arayüzünü Çalıştırın (Frontend)

Yeni bir terminal açın ve React uygulamasını ayağa kaldırın:

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 API Uç Noktaları (Endpoints)

Proje ayağa kalktıktan sonra `http://localhost:5034/swagger` adresinden Swagger arayüzüne erişebilir veya aşağıdaki uç noktaları kullanabilirsiniz:

### 💊 İlaç ve Envanter Yönetimi (Medicine)
| Metot | Endpoint | Açıklama |
| :--- | :--- | :--- |
| **GET** | `/api/Medicine` | İsim veya barkoda göre dinamik ilaç araması yapar. |
| **GET** | `/api/Medicine/{id}` | Belirli bir ilacın stok ve detaylarını getirir. |

### 👥 Hasta Yönetimi (Patient)
| Metot | Endpoint | Açıklama |
| :--- | :--- | :--- |
| **GET** | `/api/Patient?tc={tcNo}` | TC Kimlik No ile hastanın sistemdeki kaydını bulur. |
| **POST** | `/api/Patient` | Sisteme yeni bir hasta (CRM kaydı) ekler. |

### 🧾 Satış Yönetimi (Sales)
| Metot | Endpoint | Açıklama |
| :--- | :--- | :--- |
| **POST** | `/api/Sale` | Tekil ilaç satışı ve FIFO mantığı ile stok düşümü yapar. |

### 🏥 E-Reçete ve Medula Entegrasyonu (Prescription)
| Metot | Endpoint | Açıklama |
| :--- | :--- | :--- |
| **GET** | `/api/Prescription/GenerateMock?tc={tcNo}` | Test amaçlı, rastgele ilaçlardan şifrelenmiş sahte e-reçete kodu üretir. |
| **POST** | `/api/Prescription/FetchAndCart` | E-Reçete kodunu çözer, hastayı doğrular ve ilaçları sepet oluşturup ekler. |
| **POST** | `/api/Prescription/Checkout/{cartId}` | Sepeti onaylar ve sepetteki tüm ilaçları gerçek stoktan (FIFO) düşer. |

---

**Geliştirici:** Yunus Emre Kaya
