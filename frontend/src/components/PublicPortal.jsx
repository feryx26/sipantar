import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PublicPortal = ({ onBack }) => {
  const [activePage, setActivePage] = useState('beranda');
  const [komoditas, setKomoditas] = useState([]);
  const [pasar, setPasar] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [rekapData, setRekapData] = useState([]);
  const [kadisData, setKadisData] = useState({
    kadis_nama: '',
    kadis_jabatan: '',
    kadis_sambutan: '',
    kadis_foto: ''
  });
  const [ketersediaanData, setKetersediaanData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPasar, setSelectedPasar] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua Kategori');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [komoRes, pasarRes, trendRes, rekapRes, kadisRes, ketersediaanRes] = await Promise.all([
          axios.get('/api/komoditas'),
          axios.get('/api/pasar'),
          axios.get('/api/harga/trend'),
          axios.get('/api/rekap'),
          axios.get('/api/kadis'),
          axios.get('/api/ketersediaan')
        ]);
        setKomoditas(komoRes.data);
        setPasar(pasarRes.data);
        setTrendData(trendRes.data);
        setRekapData(rekapRes.data);
        setKadisData(kadisRes.data);
        setKetersediaanData(ketersediaanRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching public data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const prepareChartData = () => {
    if (!trendData || trendData.length === 0) {
      return { labels: [], datasets: [] };
    }

    const dates = [...new Set(trendData.map(d => d.tanggal))];
    const availableKomoditas = [...new Set(trendData.map(d => d.komoditas))];
    const topKomoditas = ['Beras Medium', 'Cabai Merah', 'Bawang Merah'].filter(name => availableKomoditas.includes(name));
    
    // If none of our preferred ones are there, just take the first 3
    const finalDisplay = topKomoditas.length > 0 ? topKomoditas : availableKomoditas.slice(0, 3);

    const datasets = finalDisplay.map((name, i) => {
      const colors = ['#0066cc', '#dc2626', '#d97706'];
      return {
        label: name,
        data: dates.map(d => {
          const entry = trendData.find(td => td.komoditas === name && td.tanggal === d);
          return entry ? entry.avg_harga : null;
        }),
        borderColor: colors[i % colors.length],
        backgroundColor: `${colors[i % colors.length]}1A`,
        tension: 0.4,
        fill: true,
      };
    });

    return {
      labels: dates.map(d => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
      datasets
    };
  };

  const prepareKetersediaanChartData = () => {
    if (!ketersediaanData || ketersediaanData.length === 0) {
      return { labels: [], datasets: [] };
    }

    const komoditas = [...new Set(ketersediaanData.map(d => d.nama_komoditas))];
    const pasar = [...new Set(ketersediaanData.map(d => d.nama_pasar))];
    
    const datasets = komoditas.map((nama, i) => {
      const colors = ['#00a878', '#0066cc', '#d97706', '#dc2626', '#8b5cf6'];
      return {
        label: nama,
        data: pasar.map(p => {
          const entry = ketersediaanData.find(k => k.nama_komoditas === nama && k.nama_pasar === p);
          return entry ? entry.ketersediaan : 0;
        }),
        backgroundColor: `${colors[i % colors.length]}33`,
        borderColor: colors[i % colors.length],
        borderWidth: 2,
      };
    });

    return {
      labels: pasar,
      datasets
    };
  };

  const getFilteredHarga = () => {
    return komoditas.filter(k => {
      const matchSearch = k.nama.toLowerCase().includes(searchQuery.toLowerCase());
      const matchKategori = selectedKategori === 'Semua Kategori' || k.kategori === selectedKategori;
      
      // If a specific market is selected, check if there's data for it in rekapData
      if (selectedPasar) {
        const hasPriceInMarket = rekapData.some(r => r.komoditas_id === k.id && r.pasar_id === parseInt(selectedPasar) && r.avg_harga !== null);
        return matchSearch && matchKategori && hasPriceInMarket;
      }
      
      return matchSearch && matchKategori;
    });
  };

  const getPriceForDisplay = (komoId) => {
    if (selectedPasar) {
      const entry = rekapData.find(r => r.komoditas_id === komoId && r.pasar_id === parseInt(selectedPasar));
      return entry && entry.avg_harga ? `Rp ${entry.avg_harga.toLocaleString('id-ID')}` : '-';
    } else {
      // Average across all markets
      const entries = rekapData.filter(r => r.komoditas_id === komoId && r.avg_harga !== null);
      if (entries.length === 0) return '-';
      const avg = entries.reduce((sum, r) => sum + r.avg_harga, 0) / entries.length;
      return `Rp ${Math.round(avg).toLocaleString('id-ID')}`;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'Plus Jakarta Sans', size: 11 } }
      }
    },
    scales: {
      y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Memuat data...</div>;

  return (
    <div id="appPublic">
      {/* NAVBAR */}
      <nav className="pub-nav">
        <div className="pub-nav-logo">
          <div className="pub-nav-icon">🏪</div>
          <div className="pub-nav-name">SIPANTAR</div>
        </div>
        <div className="pub-nav-links">
          <button className={`pub-nav-link ${activePage === 'beranda' ? 'active' : ''}`} onClick={() => setActivePage('beranda')}>Beranda</button>
          <button className={`pub-nav-link ${activePage === 'harga' ? 'active' : ''}`} onClick={() => setActivePage('harga')}>Cek Harga</button>
          <button className={`pub-nav-link ${activePage === 'ketersediaan' ? 'active' : ''}`} onClick={() => setActivePage('ketersediaan')}>Ketersediaan Bahan Pokok</button>
          <button className={`pub-nav-link ${activePage === 'pasar' ? 'active' : ''}`} onClick={() => setActivePage('pasar')}>Info Pasar</button>
          <button className={`pub-nav-link ${activePage === 'tren' ? 'active' : ''}`} onClick={() => setActivePage('tren')}>Grafik Tren</button>
        </div>
        <div className="pub-nav-spacer"></div>
        <div className="pub-update-chip">
          <div className="pub-update-dot"></div>
          Update: Hari ini 10:32 WIB
        </div>
        <button className="pub-nav-btn" style={{ marginLeft: '14px' }} onClick={onBack}>← Portal Login</button>
      </nav>

      {/* PAGE: BERANDA */}
      {activePage === 'beranda' && (
        <div className="pub-page active">
          <div className="pub-hero">
            <div className="pub-hero-inner">
              <div className="pub-hero-eyebrow">📊 Data resmi dari Dinas Ketahanan Pangan, Pertanian dan Perikanan Kota Tasikmalaya</div>
              <h1 className="pub-hero-title">Pantau Harga Pasar<br /><span>Secara Real-Time</span></h1>
              <p className="pub-hero-sub">Data harga komoditas pokok terkini dari {pasar.length} pasar tradisional, diperbarui setiap hari oleh enumerator terlatih.</p>
              <div className="pub-hero-stats">
                <div className="pub-hero-stat"><div className="val">{pasar.length}</div><div className="lbl">Pasar Aktif</div></div>
                <div className="pub-hero-stat"><div className="val">{komoditas.length}</div><div className="lbl">Komoditas</div></div>
                <div className="pub-hero-stat"><div className="val">127</div><div className="lbl">Pedagang</div></div>
                <div className="pub-hero-stat"><div className="val">Hari ini</div><div className="lbl">Update Terakhir</div></div>
              </div>
            </div>
          </div>
          
          <div className="pub-container">
            <div className="pub-section">
              {/* Alert */}
              <div className="pub-alert-banner warn">
                <div className="pub-ab-icon">⚠️</div>
                <div className="pub-ab-text">
                  <div className="pub-ab-title">Peringatan Kenaikan Harga</div>
                  Harga Cabai Rawit mengalami kenaikan signifikan (+18.4%) dalam 7 hari terakhir. Pantau terus perkembangan harga.
                </div>
              </div>

              {/* KEPALA DINAS SECTION */}
              <div className="kadis-section" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <div className="pub-container">
                  <div className="kadis-card">
                    <div className="kadis-photo">
                      {kadisData.kadis_foto ? (
                        <img src={kadisData.kadis_foto} alt={kadisData.kadis_nama} />
                      ) : (
                        <div className="kadis-photo-placeholder">👤</div>
                      )}
                    </div>
                    <div className="kadis-content">
                      <div className="kadis-title">Sambutan {kadisData.kadis_jabatan || 'Kepala Dinas'}</div>
                      <h2 className="kadis-name">{kadisData.kadis_nama || 'Nama Kepala Dinas'}</h2>
                      <p className="kadis-message">
                        {kadisData.kadis_sambutan || 'Selamat datang di portal informasi harga pasar. Kami berkomitmen memberikan data yang akurat dan transparan.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="pub-info-grid">
                <div className="pub-info-box"><div className="pub-info-val" style={{ color: '#0066cc' }}>{komoditas.length}</div><div className="pub-info-lbl">Komoditas Dipantau</div><div className="pub-info-sub">Update harian</div></div>
                <div className="pub-info-box"><div className="pub-info-val" style={{ color: '#00a878' }}>{pasar.length}</div><div className="pub-info-lbl">Pasar Aktif</div><div className="pub-info-sub">Wilayah kota</div></div>
                <div className="pub-info-box"><div className="pub-info-val" style={{ color: '#d97706' }}>+2.3%</div><div className="pub-info-lbl">Inflasi Bulan Ini</div><div className="pub-info-sub">MoM vs bulan lalu</div></div>
                <div className="pub-info-box"><div className="pub-info-val" style={{ color: '#dc2626' }}>3</div><div className="pub-info-lbl">Komoditas Waspada</div><div className="pub-info-sub">Harga di atas normal</div></div>
              </div>

              {/* Highlights */}
              <div className="pub-section-head">
                <div><div className="pub-section-title">Harga Komoditas Hari Ini</div><div className="pub-section-sub">Rata-rata dari semua pasar</div></div>
                <button className="btn btn-primary btn-sm" onClick={() => setActivePage('harga')}>Lihat Semua →</button>
              </div>
              <div className="pub-highlight-grid">
                {komoditas.slice(0, 4).map(k => (
                  <div key={k.id} className="pub-hl-card">
                    <div className="pub-hl-name">{k.nama}</div>
                    <div className="pub-hl-price">Rp {k.harga_base.toLocaleString('id-ID')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#00a878' }}>
                      <span>▲</span> 0.0% (Stabil)
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="pub-info-box" style={{ marginTop: '30px', padding: '25px', textAlign: 'left' }}>
                <div className="pub-section-title" style={{ fontSize: '18px' }}>Tren Harga 7 Hari Terakhir</div>
                <div style={{ height: '300px', marginTop: '20px' }}>
                  <Line data={prepareChartData()} options={chartOptions} />
                </div>
              </div>

              {/* Pasar Grid */}
              <div className="pub-section-head" style={{ marginTop: '40px' }}>
                <div><div className="pub-section-title">Info Pasar</div><div className="pub-section-sub">Pilih pasar untuk melihat harga spesifik</div></div>
              </div>
              <div className="pub-pasar-grid">
                {pasar.map(p => (
                  <div key={p.id} className="pub-pasar-card">
                    <div className="pub-pasar-icon">{p.icon || '🏪'}</div>
                    <div className="pub-pasar-name">{p.nama}</div>
                    <div className="pub-pasar-count">{p.pedagang_count || 0} Pedagang</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>{p.jam_operasional}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE: CEK HARGA */}
      {activePage === 'harga' && (
        <div className="pub-page active">
          <div className="pub-container">
            <div className="pub-section">
              <div className="pub-section-title">Cek Harga Komoditas</div>
              <div className="pub-section-sub">Data harga terkini dari semua pasar, diperbarui setiap hari kerja</div>
              
              <div className="pub-filter" style={{ marginTop: '16px' }}>
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label>🔍 Cari Komoditas</label>
                  <input 
                    type="text" 
                    placeholder="Nama komoditas..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Pasar</label>
                  <select 
                    value={selectedPasar}
                    onChange={(e) => setSelectedPasar(e.target.value)}
                  >
                    <option value="">Semua Pasar</option>
                    {pasar.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Kategori</label>
                  <select 
                    value={selectedKategori}
                    onChange={(e) => setSelectedKategori(e.target.value)}
                  >
                    <option value="Semua Kategori">Semua Kategori</option>
                    {[...new Set(komoditas.map(k => k.kategori))].map(kat => (
                      <option key={kat} value={kat}>{kat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="tbl-wrap">
                <table className="pub-table">
                  <thead>
                    <tr>
                      <th>KOMODITAS</th>
                      <th>SATUAN</th>
                      <th>KATEGORI</th>
                      <th>{selectedPasar ? 'HARGA' : 'RATA-RATA'}</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredHarga().map(k => (
                      <tr key={k.id}>
                        <td>{k.nama}</td>
                        <td>{k.satuan}</td>
                        <td>{k.kategori}</td>
                        <td className="pub-price">{getPriceForDisplay(k.id)}</td>
                        <td><span className="badge badge-green">STABIL</span></td>
                      </tr>
                    ))}
                    {getFilteredHarga().length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
                          Data tidak ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE: INFO PASAR */}
      {activePage === 'pasar' && (
        <div className="pub-page active">
          <div className="pub-container">
            <div className="pub-section">
              <div className="pub-section-title">Informasi Pasar Tradisional</div>
              <div className="pub-section-sub">Detail lokasi dan jam operasional pasar di wilayah pantauan</div>
              
              <div className="pub-pasar-grid" style={{ marginTop: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {pasar.map(p => (
                  <div key={p.id} className="card" style={{ background: '#fff', border: '1px solid var(--pub-border)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid var(--pub-border)' }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{p.icon || '🏪'}</div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--pub-text)' }}>{p.nama}</h3>
                      <div style={{ fontSize: '12px', color: 'var(--pub-accent)', fontWeight: '700', marginTop: '4px' }}>KODE: {p.kode}</div>
                    </div>
                    <div style={{ padding: '20px' }}>
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--pub-text2)', textTransform: 'uppercase', letterSpacing: '1px' }}>📍 Alamat</label>
                        <div style={{ fontSize: '13px', color: 'var(--pub-text)', marginTop: '4px' }}>{p.alamat}</div>
                      </div>
                      <div className="form-row">
                        <div>
                          <label style={{ fontSize: '10px', color: 'var(--pub-text2)', textTransform: 'uppercase', letterSpacing: '1px' }}>🕒 Operasional</label>
                          <div style={{ fontSize: '13px', color: 'var(--pub-text)', marginTop: '4px' }}>{p.jam_operasional}</div>
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', color: 'var(--pub-text2)', textTransform: 'uppercase', letterSpacing: '1px' }}>👤 Pedagang</label>
                          <div style={{ fontSize: '13px', color: 'var(--pub-text)', marginTop: '4px' }}>{p.pedagang_count} Terdaftar</div>
                        </div>
                      </div>
                      <button 
                        className="btn btn-primary btn-full" 
                        style={{ marginTop: '20px', background: 'var(--pub-accent)', color: '#fff' }}
                        onClick={() => {
                          setSelectedPasar(p.id.toString());
                          setActivePage('harga');
                        }}
                      >
                        Lihat Harga di Pasar Ini
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE: TREN */}
      {activePage === 'tren' && (
        <div className="pub-page active">
          <div className="pub-container">
            <div className="pub-section">
              <div className="pub-section-title">Grafik Tren Harga</div>
              <div className="pub-section-sub">Analisis fluktuasi harga komoditas utama dalam 10 hari terakhir</div>
              
              <div className="card" style={{ background: '#fff', border: '1px solid var(--pub-border)', borderRadius: '16px', padding: '24px', marginTop: '20px' }}>
                <div style={{ height: '450px' }}>
                  <Line data={prepareChartData()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { position: 'bottom' } } }} />
                </div>
              </div>
              
              <div className="pub-info-grid" style={{ marginTop: '24px' }}>
                {prepareChartData().datasets.map((ds, i) => (
                  <div key={i} className="pub-info-box" style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: ds.borderColor }}></div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{ds.label}</div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--pub-text2)' }}>
                      Status: <span style={{ color: '#00a878', fontWeight: '700' }}>STABIL</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE: KETERSEDIAAN BAHAN POKOK */}
      {activePage === 'ketersediaan' && (
        <div className="pub-page active">
          <div className="pub-container">
            <div className="pub-section">
              <div className="pub-section-head">
                <div>
                  <div className="pub-section-title">Ketersediaan Bahan Pokok</div>
                  <div className="pub-section-sub">Status ketersediaan komoditas penting di pasar-pasar Kota Tasikmalaya</div>
                </div>
              </div>

              {/* Grafik Ketersediaan */}
              <div className="card" style={{ background: '#fff', border: '1px solid var(--pub-border)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ height: '400px' }}>
                  <Line 
                    data={prepareKetersediaanChartData()} 
                    options={{ 
                      ...chartOptions, 
                      plugins: { 
                        ...chartOptions.plugins, 
                        legend: { position: 'bottom' },
                        title: {
                          display: true,
                          text: 'Grafik Ketersediaan Bahan Pokok per Pasar',
                          font: { size: 16, weight: 'bold' }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: {
                            display: true,
                            text: 'Persentase Ketersediaan (%)'
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </div>

              {/* Tabel Ketersediaan */}
              <div className="card" style={{ background: '#fff', border: '1px solid var(--pub-border)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: 'var(--pub-text)' }}>
                  📊 Tabel Ketersediaan Bahan Pokok
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="pub-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--pub-border)' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--pub-text2)' }}>Komoditas</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--pub-text2)' }}>Ketersediaan</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--pub-text2)' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--pub-text2)' }}>Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ketersediaanData && ketersediaanData.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: 'var(--pub-text)' }}>
                            {item.nama_komoditas}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <div style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              width: '60px',
                              height: '60px',
                              borderRadius: '50%',
                              background: item.ketersediaan >= 80 ? '#dcfce7' : item.ketersediaan >= 50 ? '#fef3c7' : '#fee2e2',
                              color: item.ketersediaan >= 80 ? '#166534' : item.ketersediaan >= 50 ? '#92400e' : '#991b1b',
                              fontWeight: '700',
                              fontSize: '14px'
                            }}>
                              {item.ketersediaan}%
                            </div>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              background: item.ketersediaan >= 80 ? '#dcfce7' : item.ketersediaan >= 50 ? '#fef3c7' : '#fee2e2',
                              color: item.ketersediaan >= 80 ? '#166534' : item.ketersediaan >= 50 ? '#92400e' : '#991b1b'
                            }}>
                              {item.ketersediaan >= 80 ? 'Tersedia' : item.ketersediaan >= 50 ? 'Terbatas' : 'Langka'}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--pub-text2)' }}>
                            {item.updated_at ? new Date(item.updated_at).toLocaleDateString('id-ID') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ringkasan Status */}
              <div className="pub-info-grid" style={{ marginTop: '24px' }}>
                <div className="pub-info-box" style={{ background: '#dcfce7', border: '1px solid #bbf7d0' }}>
                  <div className="pub-info-val" style={{ color: '#166534' }}>
                    {ketersediaanData ? ketersediaanData.filter(item => item.ketersediaan >= 80).length : 0}
                  </div>
                  <div className="pub-info-lbl" style={{ color: '#166534' }}>Tersedia Normal</div>
                </div>
                <div className="pub-info-box" style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
                  <div className="pub-info-val" style={{ color: '#92400e' }}>
                    {ketersediaanData ? ketersediaanData.filter(item => item.ketersediaan >= 50 && item.ketersediaan < 80).length : 0}
                  </div>
                  <div className="pub-info-lbl" style={{ color: '#92400e' }}>Tersedia Terbatas</div>
                </div>
                <div className="pub-info-box" style={{ background: '#fee2e2', border: '1px solid #fecaca' }}>
                  <div className="pub-info-val" style={{ color: '#991b1b' }}>
                    {ketersediaanData ? ketersediaanData.filter(item => item.ketersediaan < 50).length : 0}
                  </div>
                  <div className="pub-info-lbl" style={{ color: '#991b1b' }}>Tersedia Langka</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="pub-footer">
        <div className="pub-footer-inner">
          <div className="pub-footer-logo">🏪 SIPANTAR</div>
          <div className="pub-footer-links">
            <span className="pub-footer-link">Tentang</span>
            <span className="pub-footer-link">Kontak Dinas</span>
            <span className="pub-footer-link">API Data</span>
          </div>
          <div style={{ fontSize: '12px' }}>© 2025 Dinas Ketahanan Pangan, Pertanian dan Perikanan Kota Tasikmalaya • Data diperbarui setiap hari</div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortal;
