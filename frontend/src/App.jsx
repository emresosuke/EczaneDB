import { useState, useEffect } from 'react'

function App() {
  // --- İLAÇ ENVANTERİ STATE'LERİ ---
  const [medicines, setMedicines] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  // --- HASTA CRM STATE'LERİ ---
  const [patientTc, setPatientTc] = useState('')
  const [currentPatient, setCurrentPatient] = useState(null)
  const [isPatientFound, setIsPatientFound] = useState(null) // null: arama yapılmadı, true: bulundu, false: bulunamadı
  const [newPatient, setNewPatient] = useState({ firstName: '', lastName: '', phone: '' })

  // 1. İlaç Arama (Canlı)
  useEffect(() => {
    fetch(`http://localhost:5034/api/Medicine?search=${searchTerm}`)
      .then(response => response.json())
      .then(data => setMedicines(data))
      .catch(error => console.error("API hatası:", error))
  }, [searchTerm])

  // 2. Hasta Sorgulama (Butona basınca)
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

  // 3. Yeni Hasta Ekleme (Form Gönderilince)
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    const patientData = {
      identityNumber: patientTc,
      firstName: newPatient.firstName,
      lastName: newPatient.lastName,
      phone: newPatient.phone
    };

    try {
      const response = await fetch('http://localhost:5034/api/Patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });

      if (response.status === 201) {
        alert("Hasta başarıyla sisteme kaydedildi!");
        searchPatient(); // Kayıttan sonra hastayı ekranda göstermek için tekrar ara
      } else {
        alert("Kayıt sırasında bir hata oluştu.");
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '40px' }}>💊 EczaneDB Yönetim Paneli</h1>
      
      {/* --- ÜST PANEL: HASTA CRM --- */}
      <div style={{ backgroundColor: '#e8f4f8', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
        <h2 style={{ marginTop: 0, color: '#2980b9' }}>👥 Hasta İşlemleri</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="TC Kimlik No Giriniz..." 
            value={patientTc}
            onChange={(e) => setPatientTc(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button 
            onClick={searchPatient}
            style={{ padding: '10px 20px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Sorgula
          </button>
        </div>

        {/* Hasta Bulunduysa Bilgilerini Göster */}
        {isPatientFound === true && currentPatient && (
          <div style={{ padding: '15px', backgroundColor: '#d4efdf', borderRadius: '4px', borderLeft: '4px solid #27ae60' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#27ae60' }}>✓ Sistemde Kayıtlı Hasta</h4>
            <p style={{ margin: 0 }}><strong>Ad Soyad:</strong> {currentPatient.firstName} {currentPatient.lastName}</p>
            <p style={{ margin: 0 }}><strong>Telefon:</strong> {currentPatient.phone}</p>
          </div>
        )}

        {/* Hasta Bulunamadıysa Kayıt Formu Göster */}
        {isPatientFound === false && (
          <div style={{ padding: '15px', backgroundColor: '#fadbd8', borderRadius: '4px', borderLeft: '4px solid #c0392b' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#c0392b' }}>⚠ Hasta Bulunamadı - Yeni Kayıt Oluştur</h4>
            <form onSubmit={handleCreatePatient} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Ad" required onChange={e => setNewPatient({...newPatient, firstName: e.target.value})} style={{ padding: '8px' }}/>
              <input type="text" placeholder="Soyad" required onChange={e => setNewPatient({...newPatient, lastName: e.target.value})} style={{ padding: '8px' }}/>
              <input type="text" placeholder="Telefon" required onChange={e => setNewPatient({...newPatient, phone: e.target.value})} style={{ padding: '8px' }}/>
              <button type="submit" style={{ padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Sisteme Kaydet
              </button>
            </form>
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '2px dashed #bdc3c7', margin: '30px 0' }} />

      {/* --- ALT PANEL: İLAÇ ENVANTERİ --- */}
      <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '20px' }}>
        <h2 style={{ marginTop: 0, color: '#34495e' }}>🔍 İlaç Envanteri</h2>
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
              <li key={med.id} style={{ padding: '12px 0', borderBottom: '1px solid #e1e8ed', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{med.name}</strong> 
                  <span style={{ color: '#7f8c8d', fontSize: '13px', marginLeft: '10px' }}>Barkod: {med.barcode}</span>
                </div>
                <div style={{ fontWeight: 'bold', color: '#27ae60' }}>{med.basePrice} ₺</div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}

export default App