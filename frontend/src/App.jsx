import { useState, useEffect } from 'react'

function App() {
  const [medicines, setMedicines] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const [eRecipeCode, setERecipeCode] = useState('')
  const [activeCart, setActiveCart] = useState(null)

  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [patients, setPatients] = useState([]);

  const fetchMedicines = () => {
    fetch(`http://localhost:5034/api/Medicine?search=${searchTerm}&t=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => setMedicines(data))
      .catch(err => console.error("API hatası:", err))
  }

  const fetchPatients = () => {
    fetch('http://localhost:5034/api/Patient/All')
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        setIsDbModalOpen(true);
      })
      .catch(err => console.error("API hatası:", err))
  }

  const handleDeletePatient = async (id) => {
    if (!window.confirm("Bu hastayı silmek istediğinize emin misiniz?")) return;
    try {
      const response = await fetch(`http://localhost:5034/api/Patient/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchPatients();
      } else {
        const err = await response.text();
        alert(`❌ Hata: ${err}`);
      }
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    identityNumber: '', firstName: '', lastName: '', phone: '', chronicIllnesses: '', allergies: ''
  });

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5034/api/Patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient)
      });
      if (response.ok) {
        fetchPatients();
        setIsAddingPatient(false);
        setNewPatient({ identityNumber: '', firstName: '', lastName: '', phone: '', chronicIllnesses: '', allergies: '' });
      } else {
        const err = await response.text();
        alert(`❌ Hata: ${err}`);
      }
    } catch (error) {
      console.error("Ekleme hatası:", error);
    }
  };

  useEffect(() => { 
    fetchMedicines() 
  }, [searchTerm])

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

  const [receiptData, setReceiptData] = useState(null);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (isDbModalOpen || isSalesModalOpen || receiptData) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isDbModalOpen, isSalesModalOpen, receiptData]);

  const fetchSalesHistory = async () => {
    try {
      const res = await fetch('http://localhost:5034/api/Prescription/History');
      if (res.ok) {
        const data = await res.json();
        setSalesHistory(data);
        const revenue = data.reduce((acc, sale) => acc + sale.totalAmount, 0);
        setTotalRevenue(revenue);
        setIsSalesModalOpen(true);
      }
    } catch (err) {
      console.error("Satış geçmişi alınamadı:", err);
    }
  };

  const handleCheckout = async () => {
    if (!activeCart) return;

    try {
      const response = await fetch(`http://localhost:5034/api/Prescription/Checkout/${activeCart.cartId}`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setReceiptData(data.receipt);
        setActiveCart(null);
        setERecipeCode('');
        fetchMedicines();
      } else {
        const err = await response.text();
        alert(err);
      }
    } catch (error) {
      console.error("Ödeme hatası:", error);
    }
  }

  const handleGenerateMock = async () => {
    const testTc = prompt("Sistemde kayıtlı bir hastanın TC numarasını girin:", "12736967201");
    if (!testTc) return;

    try {
      const response = await fetch(`http://localhost:5034/api/Prescription/GenerateMock?tc=${testTc}`);
      if (response.ok) {
        const data = await response.json();
        setERecipeCode(data.code);
        alert(`✅ Devlet Sunucusu Simüle Edildi!\n\n15 Haneli e-Reçete Kodu: ${data.code}\n\nKod arama kutusuna otomatik olarak eklendi.`);
      } else {
        const err = await response.text();
        alert(`❌ Hata: ${err}`);
      }
    } catch (error) {
      console.error("Mock üretme hatası:", error);
      alert("Sunucuya ulaşılamadı. Lütfen backend'in çalıştığından emin olun.");
    }
  }

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', padding: '40px', fontFamily: 'system-ui' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', margin: 0 }}>💊 EczaneDB Terminali</h1>
        <button onClick={fetchSalesHistory} style={{ padding: '12px 20px', backgroundColor: '#f1c40f', color: '#d35400', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          💰 Kasayı Görüntüle
        </button>
      </div>

      {medicines.filter(m => m.stockQuantity < 5).length > 0 && (
        <div style={{ backgroundColor: '#fdf2e9', borderLeft: '5px solid #e67e22', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#d35400' }}>🚨 Kritik Stok Uyarısı!</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#c0392b' }}>
            {medicines.filter(m => m.stockQuantity < 5).map(m => (
              <li key={m.id}>
                <strong>{m.name}</strong> stoku tükenmek üzere! (Kalan: {m.stockQuantity})
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div style={{ backgroundColor: '#e8f4f8', borderRadius: '8px', padding: '20px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ marginTop: 0, color: '#2980b9' }}>🔐 1. Adım: e-Reçete (Medula) Sorgulama</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchPatients} style={{ padding: '8px 15px', backgroundColor: '#8e44ad', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
              🗄️ Veritabanını Aç
            </button>
            <button onClick={handleGenerateMock} style={{ padding: '8px 15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
              ⚙️ Test Reçetesi Üret
            </button>
          </div>
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
                  <span style={{ fontSize: '12px', backgroundColor: '#ecf0f1', padding: '2px 6px', borderRadius: '4px', marginLeft: '10px', color: '#7f8c8d' }}>🏢 {med.producerCompany}</span>
                  <div style={{ color: '#7f8c8d', fontSize: '13px', marginTop: '5px' }}>
                    Barkod: {med.barcode} | <span style={{ color: isOutOfStock ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>Stok: {isOutOfStock ? "TÜKENDİ" : `${med.stockQuantity} adet`}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '20px' }}>{med.basePrice} ₺</div>
                  <button 
                    onClick={async () => {
                      const newStock = prompt(`"${med.name}" için yeni stok miktarını girin:`, med.stockQuantity);
                      if (newStock === null || newStock.trim() === '') return;
                      const quantity = parseInt(newStock, 10);
                      if (isNaN(quantity) || quantity < 0) return alert('Lütfen geçerli bir sayı girin.');
                      
                      try {
                        const response = await fetch(`http://localhost:5034/api/Medicine/${med.id}/stock`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ quantity })
                        });
                        if (response.ok) {
                          fetchMedicines();
                        } else {
                          const err = await response.text();
                          alert(`Hata: ${err}`);
                        }
                      } catch (error) {
                        console.error('Stok güncelleme hatası:', error);
                      }
                    }}
                    style={{ padding: '6px 10px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                  >
                    ✎ Stok Güncelle
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {isDbModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '10px', width: '80%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
              <h2 style={{ margin: 0, color: '#8e44ad' }}>🗄️ Veritabanı (Hastalar)</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setIsAddingPatient(!isAddingPatient)} style={{ padding: '8px 15px', backgroundColor: isAddingPatient ? '#95a5a6' : '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {isAddingPatient ? 'İptal' : '➕ Yeni Ekle'}
                </button>
                <button onClick={() => setIsDbModalOpen(false)} style={{ padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Kapat</button>
              </div>
            </div>
            
            <div style={{ padding: '0 30px 20px 30px', overflowY: 'auto', flex: 1, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>
                {`
                  .no-scrollbar::-webkit-scrollbar {
                    display: none;
                  }
                `}
              </style>

              {isAddingPatient && (
                <form onSubmit={handleAddPatient} style={{ backgroundColor: '#fdfefe', padding: '20px', borderRadius: '8px', border: '1px solid #d5dbdb', marginTop: '20px', marginBottom: '20px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Yeni Hasta Kaydı</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input required type="text" placeholder="TC Kimlik (11 Hane)" value={newPatient.identityNumber} onChange={e => setNewPatient({...newPatient, identityNumber: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <input required type="text" placeholder="Ad" value={newPatient.firstName} onChange={e => setNewPatient({...newPatient, firstName: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <input required type="text" placeholder="Soyad" value={newPatient.lastName} onChange={e => setNewPatient({...newPatient, lastName: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <input required type="text" placeholder="Telefon" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <input type="text" placeholder="Kronik Hastalıklar (İsteğe Bağlı)" value={newPatient.chronicIllnesses} onChange={e => setNewPatient({...newPatient, chronicIllnesses: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <input type="text" placeholder="Alerjiler (İsteğe Bağlı)" value={newPatient.allergies} onChange={e => setNewPatient({...newPatient, allergies: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>
                  <button type="submit" style={{ marginTop: '15px', width: '100%', padding: '12px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Kaydet</button>
                </form>
              )}

              <table className="no-scrollbar" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>TC Kimlik</th>
                    <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Ad Soyad</th>
                    <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Alerji</th>
                    <th style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 10px', fontFamily: 'monospace', fontSize: '16px', color: '#2c3e50' }}>{p.identityNumber}</td>
                      <td style={{ padding: '12px 10px' }}>{p.firstName} {p.lastName}</td>
                      <td style={{ padding: '12px 10px' }}>{p.allergies}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(p.identityNumber);
                            alert(`${p.identityNumber} kopyalandı! Test Reçetesi üretirken kullanabilirsiniz.`);
                          }}
                          style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', marginRight: '5px' }}
                        >
                          📋 Kopyala
                        </button>
                        <button 
                          onClick={() => handleDeletePatient(p.id)}
                          style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          🗑️ Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {receiptData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <style>
            {`
              @media print {
                html, body {
                  height: 100vh !important;
                  overflow: hidden !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                body * {
                  visibility: hidden;
                }
                #printable-receipt, #printable-receipt * {
                  visibility: visible;
                }
                #printable-receipt {
                  position: absolute;
                  left: 50%;
                  transform: translateX(-50%);
                  top: 0;
                  width: 350px;
                  margin: 0;
                  padding: 20px;
                  box-shadow: none !important;
                }
                .no-print {
                  display: none !important;
                }
                @page {
                  margin: 0;
                }
              }
            `}
          </style>
          <div id="printable-receipt" style={{ backgroundColor: 'white', padding: '40px', width: '350px', display: 'flex', flexDirection: 'column', fontFamily: '"Courier New", Courier, monospace', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ borderBottom: '2px dashed #000', paddingBottom: '15px', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '24px' }}>ECZANEDB A.Ş.</h2>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>Merkez Şube - VKN: 1234567890</p>
              <p style={{ margin: 0, fontSize: '12px' }}>Tarih: {new Date(receiptData.date).toLocaleString('tr-TR')}</p>
              <p style={{ margin: 0, fontSize: '12px' }}>Fiş No: {receiptData.cartId.toString().padStart(6, '0')}</p>
            </div>
            
            <div style={{ marginBottom: '15px', fontSize: '14px' }}>
              <p style={{ margin: '2px 0' }}><strong>MÜŞTERİ:</strong> {receiptData.patientTc}</p>
              <p style={{ margin: '2px 0' }}><strong>HEKİM:</strong> {receiptData.doctorName}</p>
            </div>

            <div style={{ borderBottom: '2px dashed #000', paddingBottom: '15px', marginBottom: '15px' }}>
              <h1 style={{ margin: 0, fontSize: '32px' }}>TOPLAM: {Number(receiptData.totalAmount).toFixed(2)} ₺</h1>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>* KDV DAHİLDİR (%8)</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>SAĞLIKLI GÜNLER DİLERİZ</p>
              <p style={{ margin: 0, fontSize: '12px' }}>Bizi tercih ettiğiniz için teşekkürler.</p>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => window.print()} style={{ flex: 1, padding: '10px', backgroundColor: '#34495e', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>🖨️ YAZDIR</button>
              <button onClick={() => setReceiptData(null)} style={{ flex: 1, padding: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>KAPAT</button>
            </div>
          </div>
        </div>
      )}

      {isSalesModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1500 }}>
          <div style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', width: '90%', maxWidth: '900px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 15px 30px rgba(0,0,0,0.2)' }}>
            
            <div style={{ padding: '25px 30px', backgroundColor: '#2c3e50', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>📊 Günlük Kasa ve Satış Geçmişi</h2>
              <button onClick={() => setIsSalesModalOpen(false)} style={{ padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Kapat</button>
            </div>

            <div style={{ padding: '20px 30px', backgroundColor: 'white', borderBottom: '2px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold' }}>Toplam Satış Adedi</p>
                <h3 style={{ margin: '5px 0 0 0', fontSize: '24px', color: '#2980b9' }}>{salesHistory.length} İşlem</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold' }}>Bugünkü Kasa Ciro</p>
                <h1 style={{ margin: '5px 0 0 0', fontSize: '36px', color: '#27ae60' }}>{Number(totalRevenue).toFixed(2)} ₺</h1>
              </div>
            </div>
            
            <div style={{ padding: '0 30px 20px 30px', overflowY: 'auto', flex: 1 }}>
              {salesHistory.map((sale, index) => (
                <div key={sale.cartId} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e1e8ed', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '16px', color: '#2c3e50' }}>İşlem #{sale.cartId}</strong>
                      <span style={{ marginLeft: '15px', color: '#7f8c8d', fontSize: '13px' }}>{new Date(sale.date).toLocaleString('tr-TR')}</span>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#27ae60', fontSize: '18px' }}>{Number(sale.totalAmount).toFixed(2)} ₺</div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#34495e', marginBottom: '10px' }}>
                    <strong>Hasta:</strong> {sale.patientName} | <strong>Satış Kalemleri:</strong>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f8c8d', fontSize: '13px' }}>
                    {sale.items.map((item, idx) => (
                      <li key={idx}>{item.medicineName} (x{item.quantity}) - {Number(item.price).toFixed(2)} ₺</li>
                    ))}
                  </ul>
                </div>
              ))}
              {salesHistory.length === 0 && <p style={{ textAlign: 'center', marginTop: '40px', color: '#95a5a6', fontSize: '18px' }}>Henüz hiç satış yapılmamış.</p>}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default App