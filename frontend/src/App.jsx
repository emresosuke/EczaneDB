import { useState, useEffect } from 'react'

function App() {
  const [medicines, setMedicines] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  // E-Reçete & Sepet State'leri
  const [eRecipeCode, setERecipeCode] = useState('')
  const [activeCart, setActiveCart] = useState(null)

  const fetchMedicines = () => {
    // 🚀 ÇÖZÜM: URL'nin sonuna &t=... ekleyerek tarayıcının Cache (Önbellek) yapmasını zorla engelliyoruz
    fetch(`http://localhost:5034/api/Medicine?search=${searchTerm}&t=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => setMedicines(data))
      .catch(err => console.error("API hatası:", err))
  }

  useEffect(() => { 
    fetchMedicines() 
  }, [searchTerm])

  // 1. E-Reçete Sorgulama (Medula'dan Çekme)
  const handleFetchPrescription = async () => {
    if (!eRecipeCode || eRecipeCode.length !== 15) {
      alert("Lütfen 15 haneli geçerli bir e-Reçete kodu girin!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5034/api/Prescription/FetchAndCart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eRecipeCode)
      });

      if (response.ok) {
        const cartData = await response.json();
        setActiveCart(cartData);
      } else {
        const err = await response.text();
        alert(`❌ Hata: ${err}`);
      }
    } catch (error) {
      console.error("Reçete sorgulama hatası:", error);
    }
  }

  // 2. Sepeti Onaylama (Transaction Checkout)
  const handleCheckout = async () => {
    if (!activeCart) return;

    try {
      const response = await fetch(`http://localhost:5034/api/Prescription/Checkout/${activeCart.cartId}`, {
        method: 'POST'
      });

      if (response.ok) {
        const msg = await response.text();
        alert(msg);
        setActiveCart(null); // Sepeti boşalt
        setERecipeCode(''); // Kodu temizle
        fetchMedicines(); // Stokların düştüğünü görmek için listeyi yenile
      } else {
        const err = await response.text();
        alert(err); // Stok yetersizse Transaction Rollback mesajını göster
      }
    } catch (error) {
      console.error("Ödeme hatası:", error);
    }
  }

  // 3. SUNUM İÇİN TEST: Hızlıca sahte reçete üretmek
  const handleGenerateMock = async () => {
    // Projeyi sunarken veritabanındaki örnek bir hastanın TC'sini buraya girersin
    const testTc = prompt("Sistemde kayıtlı bir hastanın TC numarasını girin:", "11223344556");
    if (!testTc) return;

    try {
      // Örnek olarak ID'si 1 ve 3 olan ilaçları sepete atıyoruz
      const response = await fetch(`http://localhost:5034/api/Prescription/GenerateMock?tc=${testTc}`);
      if (response.ok) {
        const data = await response.json();
        setERecipeCode(data.code);
        alert(`✅ Devlet Sunucusu Simüle Edildi!\n\n15 Haneli e-Reçete Kodu: ${data.code}\n\nKod arama kutusuna otomatik olarak eklendi.`);
      }
    } catch (error) {
      console.error("Mock üretme hatası:", error);
    }
  }

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', padding: '40px', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '40px' }}>💊 EczaneDB Medula Terminali</h1>
      
      {/* 🔐 E-REÇETE SORGULAMA PANELİ */}
      <div style={{ backgroundColor: '#e8f4f8', borderRadius: '8px', padding: '20px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ marginTop: 0, color: '#2980b9' }}>🔐 1. Adım: e-Reçete (Medula) Sorgulama</h2>
          <button onClick={handleGenerateMock} style={{ padding: '8px 15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
            ⚙️ Test Reçetesi Üret
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input 
            type="number" 
            placeholder="15 Haneli e-Reçete Kodunu Giriniz (Örn: 847563920183746)" 
            value={eRecipeCode}
            onChange={(e) => setERecipeCode(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px', letterSpacing: '2px' }}
          />
          <button onClick={handleFetchPrescription} style={{ padding: '12px 30px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            Reçeteyi İndir
          </button>
        </div>
      </div>

      {/* 🛒 SEPET VE ONAY PANELİ */}
      {activeCart && (
        <div style={{ backgroundColor: '#fffbe6', borderRadius: '8px', padding: '20px', marginBottom: '30px', border: '2px solid #f1c40f', boxShadow: '0 4px 10px rgba(241,196,15,0.2)' }}>
          <h2 style={{ marginTop: 0, color: '#d35400' }}>🛒 2. Adım: Sepet Onayı ve Kasa</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed #f39c12', paddingBottom: '15px', marginBottom: '15px' }}>
            <div>
              <p style={{ margin: '0 0 5px 0' }}><strong>Hasta:</strong> {activeCart.patient} (TC: {activeCart.patientTc})</p>
              <p style={{ margin: '0' }}><strong>Yazan Hekim:</strong> {activeCart.doctor}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#7f8c8d' }}>Sepet ID: #{activeCart.cartId}</p>
              <h3 style={{ margin: '0', color: '#c0392b', fontSize: '24px' }}>Toplam: {activeCart.totalAmount} ₺</h3>
            </div>
          </div>

          <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Reçetedeki İlaçlar:</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
            {activeCart.items.map(item => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: 'white', marginBottom: '5px', borderRadius: '4px', border: '1px solid #eee' }}>
                <span><strong>{item.name}</strong> <span style={{fontSize:'12px', color: item.stock < 1 ? 'red' : 'green'}}> (Mevcut Stok: {item.stock})</span></span>
                <strong>{item.price} ₺</strong>
              </li>
            ))}
          </ul>

          <button onClick={handleCheckout} style={{ width: '100%', padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>
            Sepeti Onayla ve Satışı Bitir
          </button>
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '2px dashed #bdc3c7', margin: '30px 0' }} />

      {/* 📦 GENEL İLAÇ ENVANTERİ */}
      <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginTop: 0, color: '#34495e' }}>📦 Canlı İlaç Envanteri</h2>
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
            return (
              <li key={med.id} style={{ padding: '15px 0', borderBottom: '1px solid #e1e8ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '18px', color: isOutOfStock ? '#95a5a6' : '#2c3e50' }}>{med.name}</strong> 
                  <div style={{ color: '#7f8c8d', fontSize: '13px', marginTop: '5px' }}>
                    Barkod: {med.barcode} | <span style={{ color: isOutOfStock ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>Stok: {isOutOfStock ? "TÜKENDİ" : `${med.stockQuantity} adet`}</span>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '20px' }}>{med.basePrice} ₺</div>
              </li>
            );
          })}
        </ul>
      </div>

    </div>
  )
}

export default App