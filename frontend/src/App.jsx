import { useState, useEffect } from 'react'

function App() {
  const [medicines, setMedicines] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const [patientTc, setPatientTc] = useState('')
  const [currentPatient, setCurrentPatient] = useState(null)
  const [isPatientFound, setIsPatientFound] = useState(null) 
  const [newPatient, setNewPatient] = useState({ firstName: '', lastName: '', phone: '' })

  // İlaç Arama
  useEffect(() => {
    fetch(`http://localhost:5034/api/Medicine?search=${searchTerm}`)
      .then(response => response.json())
      .then(data => setMedicines(data))
      .catch(error => console.error("API hatası:", error))
  }, [searchTerm])

  // Hasta Sorgulama
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

  // Yeni Hasta Ekleme
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    const patientData = { identityNumber: patientTc, firstName: newPatient.firstName, lastName: newPatient.lastName, phone: newPatient.phone };

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

  // 🚀 YENİ: SATIŞ ALGORİTMASI
  const handleSale = async (medicine) => {
    // 1. Önce hasta seçilmiş mi kontrol et
    if (!currentPatient) {
      alert("❌ Satış yapabilmek için lütfen önce üst panelden bir hasta sorgulayın!");
      return;
    }

    let hasPrescription = false;

    // 2. İlaç reçeteli mi? Eczacıya sor!
    if (medicine.requiresPrescription) {
      const isApproved = window.confirm(`DİKKAT: "${medicine.name}" reçeteye tabi bir ilaçtır!\n\nHastanın fiziki veya e-reçetesini gördünüz mü? Satışı onaylıyor musunuz?`);
      if (!isApproved) {
        alert("Satış iptal edildi.");
        return; // Reçete yoksa işlemi anında kes
      }
      hasPrescription = true;
    } else {
      hasPrescription = true; // Reçetesiz ilaç ise doğrudan geç
    }

    // 3. API'ye Satış İsteğini Fırlat
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
        alert(`✅ SATIŞ BAŞARILI!\n\n🧾 Dijital Fiş:\nHasta: ${receipt.patientInfo}\nİlaç: ${receipt.medicineInfo}\nÖdenen Tutar: ${receipt.totalAmount} ₺\nDurum: ${receipt.status}`);
      } else {
        const errorText = await response.text();
        alert(`❌ Satış Reddedildi: ${errorText}`);
      }
    } catch (error) {
      console.error("Satış hatası:", error);
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '40px' }}>💊 EczaneDB Terminali</h1>
      
      {/* ÜST PANEL: HASTA CRM */}
      <div style={{ backgroundColor: '#e8f4f8', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
        <h2 style={{ marginTop: 0, color: '#2980b9' }}>👥 1. Adım: Hasta Seçimi</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="TC Kimlik No Giriniz..." 
            value={patientTc}
            onChange={(e) => setPatientTc(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
          />
          <button onClick={searchPatient} style={{ padding: '10px 25px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
            Sorgula
          </button>
        </div>

        {isPatientFound === true && currentPatient && (
          <div style={{ padding: '15px', backgroundColor: '#d4efdf', borderRadius: '4px', borderLeft: '4px solid #27ae60' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#27ae60' }}>✅ Aktif Hasta</h4>
            <p style={{ margin: 0, fontSize: '18px' }}><strong>{currentPatient.firstName} {currentPatient.lastName}</strong></p>
          </div>
        )}

        {isPatientFound === false && (
          <div style={{ padding: '15px', backgroundColor: '#fadbd8', borderRadius: '4px', borderLeft: '4px solid #c0392b' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#c0392b' }}>⚠ Yeni Hasta Kaydı</h4>
            <form onSubmit={handleCreatePatient} style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Ad" required onChange={e => setNewPatient({...newPatient, firstName: e.target.value})} style={{ padding: '8px', flex: 1 }}/>
              <input type="text" placeholder="Soyad" required onChange={e => setNewPatient({...newPatient, lastName: e.target.value})} style={{ padding: '8px', flex: 1 }}/>
              <input type="text" placeholder="Telefon" required onChange={e => setNewPatient({...newPatient, phone: e.target.value})} style={{ padding: '8px', flex: 1 }}/>
              <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Kaydet</button>
            </form>
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '2px dashed #bdc3c7', margin: '30px 0' }} />

      {/* ALT PANEL: İLAÇ ENVANTERİ VE SATIŞ */}
      <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '20px' }}>
        <h2 style={{ marginTop: 0, color: '#34495e' }}>🛒 2. Adım: İlaç Seçimi ve Satış</h2>
        <input 
          type="text" 
          placeholder="İlaç adı veya barkod ara..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '20px' }}
        />
        
        {medicines.length === 0 ? (
          <p style={{ color: '#e74c3c' }}>Aradığınız kriterde ilaç bulunamadı.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {medicines.map(med => (
              <li key={med.id} style={{ padding: '15px 0', borderBottom: '1px solid #e1e8ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '18px' }}>{med.name}</strong> 
                  {/* Reçete Uyarı Rozeti */}
                  {med.requiresPrescription && (
                    <span style={{ marginLeft: '10px', padding: '3px 8px', backgroundColor: '#e74c3c', color: 'white', fontSize: '12px', borderRadius: '12px', fontWeight: 'bold' }}>
                      Kırmızı/Yeşil Reçete
                    </span>
                  )}
                  <div style={{ color: '#7f8c8d', fontSize: '13px', marginTop: '5px' }}>Barkod: {med.barcode}</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '20px' }}>{med.basePrice} ₺</div>
                  <button 
                    onClick={() => handleSale(med)}
                    style={{ padding: '10px 20px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#d68910'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#f39c12'}
                  >
                    Satış Yap
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}

export default App