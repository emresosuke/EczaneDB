# 💊 EczaneDB - Comprehensive Pharmacy and CRM Management System

EczaneDB is an enterprise-architecture **Full-Stack Web Application** project developed to digitize and accelerate the daily operational workflows of a modern pharmacy (medicine inventory, patient/CRM management, e-Prescription integration, and sales transactions).

It is designed with an asynchronous (`async/await`) structure, keeping high-traffic scenarios in mind, and features a dynamic search engine capable of responding within milliseconds even with large datasets.

---

## 🌟 Core Features

* **🔍 Smart Medicine Inventory:** Dynamic search engine using Entity Framework `ILike` function that provides case-insensitive and Turkish character insensitive instant results based on barcode or name.
* **👥 Patient and CRM Management:** Querying patient history via National Identity Number (TC Kimlik No), registering new patients to the system, and prescription tracking.
* **📝 e-Prescription Integration and Cryptography:** Reading encrypted (Base64/JSON) 15-character e-Prescription codes, automatically fetching the patient's prescribed medicines from the Medula simulator, and transferring them to the cart.
* **🛒 Cart Logic:** Selling medicines from prescriptions through a cart in a single transaction.
* **📦 Advanced Stock Management (FIFO):** Medicine stocks are kept on a batch basis. During a sale, dynamic deduction is performed starting from the stock with the nearest expiration date (First In, First Out logic).
* **🧪 Big Data Simulation:** Data seeding with 10,000+ rows of synthetic medicine and patient data generated according to Turkish standards using the Python `Faker` library.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, React Router DOM
* **Backend:** .NET 8 (Web API), C#
* **ORM:** Entity Framework Core (EF Core) + `EFCore.NamingConventions` (snake_case)
* **Database:** PostgreSQL (Docker Container Architecture)
* **Scripting:** Python 3.x (psycopg2, Faker)
* **Security / Cryptography:** Base64 Encoding, JSON Serialization (CryptoHelper)

---

## 📂 Project Layout

```text
EczaneDB/
├── .gitignore
├── README.md
├── database/
│   ├── seed.py             # Script that populates the database with 10,000+ records
│   └── requirements.txt    # Python dependencies
├── frontend/               # User interface built with React (Vite)
└── backend/
    └── EczaneManagement.Api/
        ├── Controllers/    # Endpoints for Medicine, Patient, Sales, and Prescription
        ├── Data/           # DbContext and PostgreSQL connection bridge
        ├── Helpers/        # Cryptography (CryptoHelper) and Medula Simulator
        ├── Models/         # Models for Medicine, Patient, Stock, Cart, CartItem
        ├── Program.cs      # Application startup and service configurations
        └── appsettings.json # Database connection string
```

---

## 🚀 Setup and Execution Guide

Follow the steps below in order to get the project fully up and running on your local environment:

### 1. Clone the Repo

```bash
git clone https://github.com/emresosuke/EczaneDB.git
cd EczaneDB
```

### 2. Start the Database (Docker)

Make sure Docker Desktop is running on your computer and spin up the PostgreSQL container in an isolated manner:

```bash
docker run --name eczane-postgres -e POSTGRES_PASSWORD=1234 -p 5432:5432 -d postgres
```

### 3. Seed the Database (Data Seeding)

Run the Python script to inject synthetic pharmacy inventory and patient data into the empty database:

```bash
cd database
pip install -r requirements.txt
python seed.py
cd ..
```

### 4. Run the .NET API (Backend)

Navigate to the backend folder and start the API application:

```bash
cd backend/EczaneManagement.Api
dotnet restore
dotnet build
dotnet ef database update  # Applies Entity Framework migrations if necessary
dotnet run
```
*Note: The backend serves on `http://localhost:5034` by default.*

### 5. Run the User Interface (Frontend)

Open a new terminal and spin up the React application:

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 API Endpoints

Once the project is up and running, you can access the Swagger UI at `http://localhost:5034/swagger` or use the following endpoints:

### 💊 Medicine and Inventory Management (Medicine)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/Medicine` | Performs a dynamic medicine search by name or barcode. |
| **GET** | `/api/Medicine/{id}` | Retrieves the stock and details of a specific medicine. |

### 👥 Patient Management (Patient)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/Patient?tc={tcNo}` | Finds the patient's record in the system by National Identity Number. |
| **POST** | `/api/Patient` | Adds a new patient (CRM record) to the system. |

### 🧾 Sales Management (Sales)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/Sale` | Performs a single medicine sale and stock deduction using FIFO logic. |

### 🏥 e-Prescription and Medula Integration (Prescription)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/Prescription/GenerateMock?tc={tcNo}` | Generates an encrypted fake e-prescription code from random medicines for testing purposes. |
| **POST** | `/api/Prescription/FetchAndCart` | Decrypts the e-prescription code, verifies the patient, creates a cart, and adds the medicines to it. |
| **POST** | `/api/Prescription/Checkout/{cartId}` | Approves the cart and deducts all medicines in the cart from the actual stock (FIFO). |

---

**Developer:** Yunus Emre Kaya
