import { useState, useEffect } from 'react'

function App() {
  const [medicines, setMedicines] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const [patientTc, setPatientTc] = useState('')
  const [currentPatient, setCurrentPatient] = useState(null)
  const [isPatientFound, setIsPatientFound] = useState(null) 
  const [newPatient, setNewPatient] = useState({ firstName: '', lastName: '', phone: '', chronicIllnesses: '', allergies: '' })

  const fetchMedicines = () => {
    fetch(`http://localhost:5034/api/Medicine?search=${searchTerm}`)
      .then(response => response.json())
      .then(data => setMedicines(data))
      .catch(error => console.error("API hatası:", error))
  }

  useEffect(() => {
    fetchMedicines()
  }, [searchTerm])

  const searchPatient = async () => {
    if (!patientTc) return;
    try {
      const response = await fetch(`http://localhost:5034/api/Patient?tc=${patientTc}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentPatient(data);
        setIsPatientFound(true);
      } else if (response.status === 404) {
        setCurrentPatient(null);
        setIsPatientFound(false);
      }
    } catch (error) {
      console.error("Hasta arama hatası:", error);
    }
  }

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    const patientData = { 
      identityNumber: patientTc, 
      firstName: newPatient.firstName, 
      lastName: newPatient.lastName, 
      phone: newPatient.phone,
      chronicIllnesses: newPatient.chronicIllnesses,
      allergies: newPatient.allergies
    };

    try {
      const response = await fetch('http://localhost:5034/api/Patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
      if (response.status === 201) {
        alert("Hasta başarıyla sisteme kaydedildi!");
        searchPatient(); 
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
    }
  }

  const handleSale = async (medicine) => {
    if (!currentPatient) {
      alert("❌ Satış yapabilmek için lütfen önce üst panelden bir hasta sorgulayın!");
      return;
    }

    if (medicine.stockQuantity <= 0) {
      alert(`❌ Satış İptal Edildi: "${medicine.name}" stokta kalmamıştır!`);
      return;
    }

    let hasPrescription = false;
    if (medicine.requiresPrescription) {
      const isApproved = window.confirm(`DİKKAT: "${medicine.name}" reçeteye tabi bir ilaçtır!\n\nHastanın reçetesini gördünüz mü?`);
      if (!isApproved) return;
      hasPrescription = true;
    } else {
      hasPrescription = true;
    }

    const saleRequest = {
      patientTc: currentPatient.identityNumber,
      medicineId: medicine.id,
      hasPrescription: hasPrescription
    };

    try {
      const response = await fetch('http://localhost:5034/api/Sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleRequest)
      });

      if (response.ok) {
        const receipt = await response.json();
        alert(`✅ SATIŞ BAŞARILI!\n\n🧾 Dijital Fiş:\nHasta: ${receipt.patientInfo}\nİlaç: ${receipt.medicineInfo}\nKalan Stok: ${receipt.remainingStock} adet`);
        fetchMedicines();
      } else {
        const errorText = await response.text();
        alert(`❌ Satış Reddedildi: ${errorText}`);
      }
    } catch (error) {
      console.error("Satış hatası:", error);
    }
  }

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', padding: '40px', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '40px' }}>💊 EczaneDB Profesyonel Panel</h1>
      
      <div style={{ backgroundColor: '#e8f4f8', borderRadius: '8px', padding: '20px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginTop: 0, color: '#2980b9' }}>👥 1. Adım: Hasta Sorgulama & Sağlık Geçmişi</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="TC Kimlik No Giriniz..." 
            value={patientTc}
            onChange={(e) => setPatientTc(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
          />
          <button onClick={searchPatient} style={{ padding: '12px 30px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            Sorgula
          </button>
        </div>

        {isPatientFound === true && currentPatient && (
          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '6px', borderLeft: '6px solid #27ae60', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#27ae60' }}>✅ Aktif Hasta Dosyası</h3>
            <p style={{ fontSize: '18px', margin: '0 0 15px 0' }}><strong>Ad Soyad:</strong> {currentPatient.firstName} {currentPatient.lastName}</p>
            
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <div style={{ flex: 1, padding: '10px', backgroundColor: '#fcf3cf', borderRadius: '4px' }}>
                <strong style={{ color: '#b7950b' }}>⚠️ Kronik Rahatsızlıklar:</strong>
                <p style={{ margin: '5px 0 0 0' }}>{currentPatient.chronicIllnesses || "Yok / Belirtilmemiş"}</p>
              </div>
              <div style={{ flex: 1, padding: '10px', backgroundColor: '#fadbd8', borderRadius: '4px' }}>
                <strong style={{ color: '#78281f' }}>🚫 Alerjiler:</strong>
                <p style={{ margin: '5px 0 0 0' }}>{currentPatient.allergies || "Yok / Belirtilmemiş"}</p>
              </div>
            </div>
          </div>
        )}

        {isPatientFound === false && (
          <div style={{ padding: '20px', backgroundColor: '#fadbd8', borderRadius: '6px', borderLeft: '6px solid #c0392b' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#c0392b' }}>⚠ Hasta Bulunamadı - Yeni CRM Kaydı Oluştur</h4>
            <form onSubmit={handleCreatePatient} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input type="text" placeholder="Ad" required onChange={e => setNewPatient({...newPatient, firstName: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
              <input type="text" placeholder="Soyad" required onChange={e => setNewPatient({...newPatient, lastName: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
              <input type="text" placeholder="Telefon" required onChange={e => setNewPatient({...newPatient, phone: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
              <input type="text" placeholder="Kronik Rahatsızlıklar (Varsa)" onChange={e => setNewPatient({...newPatient, chronicIllnesses: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}/>
              <input type="text" placeholder="Alerjiler (Varsa)" style={{ gridColumn: 'span 2', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} onChange={e => setNewPatient({...newPatient, allergies: e.target.value})}/>
              <button type="submit" style={{ gridColumn: 'span 2', padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                Sisteme Kaydet ve Dosya Aç
              </button>
            </form>
          </div>
        )}
      </div>

      <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginTop: 0, color: '#34495e' }}>🛒 2. Adım: Stok Kontrollü Satış Ekranı</h2>
        <input 
          type="text" 
          placeholder="İlaç adı veya barkod ara..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '25px', boxSizing: 'border-box' }}
        />
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {medicines.map(med => {
            const isOutOfStock = med.stockQuantity <= 0;
            const isCriticalStock = med.stockQuantity > 0 && med.stockQuantity < 5;
            const stockColor = isOutOfStock ? '#e74c3c' : (isCriticalStock ? '#e67e22' : '#27ae60');

            return (
              <li key={med.id} style={{ padding: '15px 0', borderBottom: '1px solid #e1e8ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '18px', color: isOutOfStock ? '#95a5a6' : '#2c3e50' }}>{med.name}</strong> 
                  {med.requiresPrescription && (
                    <span style={{ marginLeft: '10px', padding: '3px 8px', backgroundColor: '#e74c3c', color: 'white', fontSize: '12px', borderRadius: '12px', fontWeight: 'bold' }}>
                      Reçeteli
                    </span>
                  )}
                  <div style={{ color: '#7f8c8d', fontSize: '13px', marginTop: '5px' }}>
                    Barkod: {med.barcode} | <span style={{ color: stockColor, fontWeight: 'bold' }}>Stok: {isOutOfStock ? "TÜKENDİ" : `${med.stockQuantity} adet`}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '20px' }}>{med.basePrice} ₺</div>
                  <button 
                    onClick={() => handleSale(med)}
                    disabled={isOutOfStock}
                    style={{ 
                      padding: '10px 20px', 
                      backgroundColor: isOutOfStock ? '#bdc3c7' : '#f39c12', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer', 
                      fontWeight: 'bold', 
                      fontSize: '16px' 
                    }}
                  >
                    {isOutOfStock ? "Stok Yok" : "Satış Yap"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  )
}

export default App