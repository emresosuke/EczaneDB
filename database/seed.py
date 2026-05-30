import os
import random
from datetime import datetime, timedelta
import psycopg2
from faker import Faker

# Türkçe sahte veri üreticiyi başlatalım
fake = Faker("tr_TR")

# 1. PostgreSQL Bağlantı Ayarları (Docker üzerindeki veritabanımız)
DB_CONFIG = {
    "host": "127.0.0.1",
    "database": "postgres",
    "user": "postgres",
    "password": "1234",  # Docker'da kurduğun şifre
    "port": "5432",
}


def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)


def seed_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    print("🚀 Veri basma işlemi başladı, lütfen bekleyin...")

    try:
        # --- A. İLAÇLAR (MEDICINES) ---
        print("📦 İlaçlar ekleniyor...")
        rec_types = ["Normal", "Kırmızı", "Yeşil", "Turuncu", "Mor"]
        medicine_ids = []

        # 50 farklı popüler ilaç simülasyonu
        sample_medicines = [
            "Parol",
            "Arveles",
            "Majezik",
            "Augmentin",
            "Apranax",
            "Xanax",
            "Coraspin",
            "Nexium",
            "Cataflam",
            "Dolorex",
            "Atarax",
            "Lustral",
            "Ritalin",
            "Concerta",
            "Aspirin",
        ]

        for i in range(100):  # Toplamda 100 çeşit ilaç türetelim
            barcode = "".join([str(random.randint(0, 9)) for _ in range(13)])
            base_name = random.choice(sample_medicines)
            name = f"{base_name} {random.choice(['500mg', '100mg', 'Plus', 'Şurup'])}"
            producer = fake.company() + " İlaç Sanayi"
            rec_type = random.choices(rec_types, weights=[75, 10, 8, 4, 3], k=1)[
                0
            ]  # Çoğu normal reçete olsun
            base_price = round(random.uniform(50.0, 450.0), 2)
            requires_prescription = True if rec_type != "Normal" else random.choice([True, False])

            cursor.execute(
                """
                INSERT INTO medicines (barcode, name, producer_company, rec_type, base_price, requires_prescription)
                VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;
            """,
                (barcode, name, producer, rec_type, base_price, requires_prescription),
            )
            medicine_ids.append(cursor.fetchone()[0])

        # --- B. STOKLAR (STOCKS) ---
        print("🏬 Stoklar ve Miat tarihleri kurgulanıyor...")
        for med_id in medicine_ids:
            # Her ilaçtan 2 veya 3 farklı parti (Batch) olsun ki FIFO'yu (tarihi yakın olanı satmayı) test edebilelim.
            for j in range(random.randint(2, 3)):
                batch_number = f"BATCH-{random.randint(10000, 99999)}"
                quantity = random.randint(10, 150)

                # Kimi ilacın tarihi geçmiş olsun, kiminin çok yakın, kiminin uzak (Miat takibi testi için)
                days_offset = random.randint(-30, 365)
                expiration_date = datetime.now().date() + timedelta(days=days_offset)

                cursor.execute(
                    """
                    INSERT INTO stocks (medicine_id, batch_number, quantity, expiration_date)
                    VALUES (%s, %s, %s, %s);
                """,
                    (med_id, batch_number, quantity, expiration_date),
                )

        # --- C. HASTALAR (PATIENTS) ---
        print("👤 Sahte hasta kayıtları oluşturuluyor...")
        patient_ids = []
        chronic_list = ["Diyabet", "Hipertansiyon", "Astım", "Bulunmuyor"]
        allergy_list = ["Penisilin Alerjisi", "Aspirin Duyarlılığı", "Yok"]

        for _ in range(200):  # 200 adet kayıtlı hasta crm sistemi için
            identity_number = "".join([str(random.randint(1, 9)) if i == 0 else str(random.randint(0, 9)) for i in range(11)])
            first_name = fake.first_name()
            last_name = fake.last_name()
            phone = fake.phone_number()[:15]
            chronic = random.choice(chronic_list)
            allergy = random.choice(allergy_list)

            cursor.execute(
                """
                INSERT INTO patients (identity_number, first_name, last_name, phone, chronic_illnesses, allergies)
                VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;
            """,
                (identity_number, first_name, last_name, phone, chronic, allergy),
            )
            patient_ids.append(cursor.fetchone()[0])

        # --- D. REÇETELER VE DETAYLARI (PRESCRIPTIONS & ITEMS) ---
        print("📝 Geçmiş reçete simülasyonları bağlanıyor...")
        for _ in range(150):  # Sisteme girilmiş 150 reçete
            patient_id = random.choice(patient_ids)
            doctor_name = "Dr. " + fake.name()
            protocol_number = f"REC-{random.randint(100000, 999999)}"
            prescription_date = datetime.now().date() - timedelta(days=random.randint(1, 60))
            is_approved = random.choice([True, False])

            cursor.execute(
                """
                INSERT INTO prescriptions (patient_id, doctor_name, protocol_number, prescription_date, is_approved)
                VALUES (%s, %s, %s, %s, %s) RETURNING id;
            """,
                (patient_id, doctor_name, protocol_number, prescription_date, is_approved),
            )
            prescription_id = cursor.fetchone()[0]

            # Her reçeteye rastgele 1 ila 4 farklı ilaç ekleyelim
            selected_meds = random.sample(medicine_ids, random.randint(1, 4))
            for med_id in selected_meds:
                req_qty = random.randint(1, 3)
                # Eğer reçete onaylandıysa eczacı ilacı vermiş demektir
                given_qty = req_qty if is_approved else 0

                cursor.execute(
                    """
                    INSERT INTO prescription_items (prescription_id, medicine_id, requested_quantity, given_quantity)
                    VALUES (%s, %s, %s, %s);
                """,
                    (prescription_id, med_id, req_qty, given_qty),
                )

        # Tüm işlemleri veritabanına işle
        conn.commit()
        print("✨ Tebrikler! Veritabanı başarıyla tohumlandı (Seeded).")

    except Exception as e:
        print(f"❌ Hata oluştu, işlemler geri alınıyor (Rollback): {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    seed_data()