# 💊 EczaneDB - Modern Pharmacy & CRM Management System

EczaneDB is an enterprise-architecture **Full-Stack Web Application** designed to digitize and accelerate the daily operational workflows of a modern pharmacy. It covers medicine inventory, patient CRM management, e-Prescription integration, sales tracking, and an authentic checkout experience.

It is built with a **"Zero-Configuration / Plug & Play"** philosophy. Anyone can clone the repository, run the application, and have a fully seeded local database ready in seconds without needing any external database servers!

---

## 🌟 Core Features

* **⚡ Zero-Config Architecture (SQLite):** No PostgreSQL or Docker installation required! The system automatically creates and seeds a local `eczane.db` file upon the first run.
* **📊 Sales Dashboard & Kasa:** Track your daily revenue, total sales count, and view detailed past transaction histories dynamically.
* **🧾 Authentic Receipt Generator:** Completing a sale generates an interactive, printable E-Receipt (Bilgi Fişi) with precise CSS `@media print` rules for flawless physical paper printing.
* **🚨 Smart Low Stock Alerts:** Real-time visual warnings for medicines whose stock drops below 5.
* **🔍 Live Medicine Inventory:** Instantly search through medicines using Entity Framework. Update stock amounts on the fly and view manufacturer details via clean UI badges.
* **👥 Full Patient CRM:** Manage patients! View registered individuals, copy their TC numbers for mock prescriptions, **add new patients** via a modern sliding form, or safely **delete** them.
* **📝 e-Prescription (Medula) Integration:** Generates encrypted (Base64/JSON) 15-character fake e-Prescription codes. Decrypts codes, fetches prescribed items, and validates stocks dynamically.
* **📦 FIFO Stock Management:** Stocks are depleted automatically based on earliest expiration dates during checkout.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite (Glassmorphism & Blur UI, Print CSS)
* **Backend:** .NET 8 (Web API), C#
* **ORM:** Entity Framework Core (EF Core) + `EFCore.NamingConventions` (snake_case)
* **Database:** SQLite (Embedded, Zero Setup)
* **Scripting:** Python 3.x (`sqlite3`, Faker)
* **Security:** Base64 Encoding, JSON Serialization (CryptoHelper)

---

## 🚀 "Plug & Play" Setup Guide (Tak-Çalıştır Kurulum)

This project has been heavily refactored to ensure that anyone downloading it can get it running in under 2 minutes.

### 1. Clone the Repo

```bash
git clone https://github.com/emresosuke/EczaneDB.git
cd EczaneDB
```

### 2. Run the .NET API (Backend) & Auto-Migration

Navigate to the backend folder and start the API application. Entity Framework will automatically detect the missing database and create the `eczane.db` file!

```bash
cd backend/EczaneManagement.Api
dotnet run
```
*Note: The backend serves on `http://localhost:5034`. Keep this terminal open.*

### 3. Seed the Database (Inject Data)

Open a **new terminal**. We will use the Python script to inject thousands of synthetic medicine and patient records into the newly created SQLite database.

```bash
cd database
pip install faker
python seed.py
```
*(The script will automatically find `eczane.db` and fill it with rich, Turkish-localized data.)*

### 4. Run the User Interface (Frontend)

Open a **third terminal** and spin up the React application:

```bash
cd frontend
npm install
npm run dev
```

That's it! Visit the local URL provided by Vite (e.g. `http://localhost:5173`) and start managing your pharmacy!

---

## 🌐 API Endpoints Overview

Once the project is up and running, you can access the Swagger UI at `http://localhost:5034/swagger`. Here is a glance at the main endpoints:

### 💊 Medicine & Inventory
* `GET /api/Medicine`: Search medicines dynamically.
* `POST /api/Medicine/{id}/stock`: Manually update the stock of a specific medicine.

### 👥 Patient CRM
* `GET /api/Patient/All`: Fetch all patients for the CRM dashboard.
* `POST /api/Patient`: Add a new patient.
* `DELETE /api/Patient/{id}`: Remove a patient from the system.

### 🏥 e-Prescription & Sales (Kasa)
* `GET /api/Prescription/GenerateMock?tc={tcNo}`: Generate an encrypted fake e-prescription.
* `POST /api/Prescription/FetchAndCart`: Decode prescription and initialize a cart.
* `POST /api/Prescription/Checkout/{cartId}`: Finalize sale, deduct stock, and return Printable Receipt JSON.
* `GET /api/Prescription/History`: Fetch all past completed sales for the Dashboard.

---

**Developer:** Yunus Emre Kaya
