import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  PencilLine, 
  LogOut, 
  Users, 
  Store, 
  ShoppingBasket, 
  TrendingUp, 
  Box, 
  History, 
  Package,
  Megaphone, 
  FileText, 
  Search, 
  Settings,
  Plus,
  MoreVertical
} from 'lucide-react';
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

const InternalApp = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dash');
  const [komoditas, setKomoditas] = useState([]);
  const [pasar, setPasar] = useState([]);
  const [pedagang, setPedagang] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [rekap, setRekap] = useState([]);
  const [kadisData, setKadisData] = useState({
    kadis_nama: '',
    kadis_jabatan: '',
    kadis_sambutan: '',
    kadis_foto: ''
  });
  const [ketersediaanData, setKetersediaanData] = useState([]);
  const [formData, setFormData] = useState({ komoditas_id: '', pasar_id: '', pedagang_id: '', harga: '' });
  const [editItem, setEditItem] = useState(null);
  const [showModal, setShowModal] = useState(null); // 'user', 'pasar', 'komo', 'pedagang'
  const [modalData, setModalData] = useState({});
  const [reportPreview, setReportPreview] = useState(null);
  const [reportConfig, setReportConfig] = useState({ type: 'Laporan Harian Komoditas', from: new Date().toISOString().split('T')[0], to: new Date().toISOString().split('T')[0], pasar_id: 'all' });
  const [lastPublish, setLastPublish] = useState('Hari ini 10:32 WIB');

  useEffect(() => {
    fetchData();
    fetchKadisData();
  }, []);

  const fetchData = async () => {
    try {
      const [komoRes, pasarRes, pedagangRes, logRes, userRes, historyRes, rekapRes, ketersRes] = await Promise.all([
        axios.get('/api/komoditas'),
        axios.get('/api/pasar'),
        axios.get('/api/pedagang'),
        axios.get('/api/logs'),
        axios.get('/api/users'),
        axios.get('/api/harga/history'),
        axios.get('/api/rekap'),
        axios.get('/api/ketersediaan')
      ]);
      setKomoditas(komoRes.data);
      setPasar(pasarRes.data);
      setPedagang(pedagangRes.data);
      setLogs(logRes.data);
      setUsers(userRes.data);
      setHistory(historyRes.data);
      setRekap(rekapRes.data);
      setKetersediaanData(ketersRes.data);
    } catch (err) {
      console.error("Error fetching internal data", err);
    }
  };

  const fetchKadisData = async () => {
    try {
      const res = await axios.get('/api/kadis');
      setKadisData(res.data);
    } catch (err) {
      console.error("Error fetching kadis data", err);
    }
  };

  const handleKadisUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/kadis', kadisData);
      alert('Data kepala dinas berhasil diperbarui!');
    } catch (err) {
      console.error("Error updating kadis data", err);
      alert('Gagal memperbarui data kepala dinas');
    }
  };

  const handleCrudSubmit = async (e, type) => {
    e.preventDefault();
    try {
      const url = `/api/${type}${editItem ? `/${editItem.id}` : ''}`;
      const method = editItem ? 'put' : 'post';
      await axios[method](url, modalData);
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} berhasil ${editItem ? 'diperbarui' : 'ditambahkan'}!`);
      setShowModal(null);
      setEditItem(null);
      setModalData({});
      fetchData();
    } catch (err) {
      console.error(`Error saving ${type}:`, err.response?.data || err.message);
      alert(`Gagal menyimpan data ${type}: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDelete = async (type, id) => {
    // allow passing object or id
    const theId = (typeof id === 'object' && id && id.id) ? id.id : id;
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${type} ini?`)) {
      try {
        await axios.delete(`/api/${type}/${theId}`);
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} berhasil dihapus!`);
        fetchData();
      } catch (err) {
        alert(`Gagal menghapus ${type}`);
      }
    }
  };

  const openModal = (type, item = null) => {
    setEditItem(item);
    setShowModal(type);
    
    if (item) {
      setModalData(item);
    } else {
      // Initialize with default values for new items
      const defaults = {
        users: { role: '', status: 'aktif' },
        pasar: { icon: '🏪', pedagang_count: 0 },
        komoditas: { kategori: '', satuan: 'kg' },
        pedagang: { status: 'aktif', pasar_id: '' }
      };
      setModalData(defaults[type] || {});
    }
  };

  const handleGeneratePreview = () => {
    // Logic to filter data based on config
    let filtered = [...komoditas];
    if (reportConfig.pasar_id !== 'all') {
      // In real app, we would fetch from backend with filters
    }
    setReportPreview({
      title: reportConfig.type,
      date: `${reportConfig.from} s/d ${reportConfig.to}`,
      data: filtered.slice(0, 8), // Show first 8 items for preview
      pasar: reportConfig.pasar_id === 'all' ? 'Semua Pasar' : pasar.find(p => p.id === parseInt(reportConfig.pasar_id))?.nama
    });
  };

  const handleDownloadReport = () => {
    if (!reportPreview) {
      alert("Silakan generate preview terlebih dahulu!");
      return;
    }
    
    // Simple CSV export simulation
    const headers = "Komoditas,Satuan,Kategori,Harga Dasar\n";
    const rows = komoditas.map(k => `${k.nama},${k.satuan},${k.kategori},${k.harga_base}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `SIPANTAR_${reportConfig.type.replace(/\s+/g, '_')}_${reportConfig.from}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    alert("Laporan berhasil diunduh dalam format CSV (simulasi PDF/Excel)!");
  };

  const handlePublish = async () => {
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      await axios.post('/api/logs', {
        aksi: 'Publikasi data harga ke portal publik',
        user_id: user.id
      });
      setLastPublish(`Hari ini ${timeStr} WIB`);
      alert("Data berhasil dipublikasikan ke portal publik!");
      fetchData(); // Refresh logs
    } catch (err) {
      alert("Gagal melakukan publikasi data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/harga', {
        ...formData,
        user_id: user.id
      });
      alert("Harga berhasil disimpan!");
      setFormData({ komoditas_id: '', pasar_id: '', pedagang_id: '', harga: '' });
      fetchData(); // Refresh logs and other data
    } catch (err) {
      alert("Gagal menyimpan harga");
    }
  };

  const menuConfig = {
    enumerator: [
      { section: 'SURVEY HARIAN', items: [
        { id: 'dash', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'input', label: 'Input Harga', icon: <PencilLine size={18} />, badge: '!' },
        { id: 'riwayat', label: 'Riwayat Input', icon: <History size={18} /> },
      ]},
      { section: 'REFERENSI', items: [
        { id: 'listPedagang', label: 'Pedagang Saya', icon: <Users size={18} /> },
        { id: 'manPedagang', label: 'Data Pedagang', icon: <Store size={18} /> },
      ]}
    ],
    admin: [
      { section: 'OVERVIEW', items: [
        { id: 'dash', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'rekap', label: 'Rekapitulasi', icon: <History size={18} /> },
      ]},
      { section: 'ANALISIS', items: [
        { id: 'inflasi', label: 'Inflasi & Tren', icon: <TrendingUp size={18} /> },
        { id: 'stok', label: 'Data Stok', icon: <Box size={18} /> },
      ]},
      { section: 'KETERSEDIAAN', items: [
        { id: 'ketersediaan', label: 'Ketersediaan Bahan Pokok', icon: <Package size={18} /> },
      ]},
      { section: 'MANAJEMEN', items: [
        { id: 'users', label: 'Kelola Pengguna', icon: <Users size={18} />, pill: 'NEW' },
        { id: 'manPasar', label: 'Data Pasar', icon: <Store size={18} /> },
        { id: 'manKomoditas', label: 'Data Komoditas', icon: <ShoppingBasket size={18} /> },
        { id: 'manPedagang', label: 'Data Pedagang', icon: <Users size={18} /> },
      ]},
      { section: 'SISTEM', items: [
        { id: 'log', label: 'Audit Log', icon: <Search size={18} /> },
        { id: 'settings', label: 'Pengaturan', icon: <Settings size={18} /> },
      ]}
    ],
    dinas: [
      { section: 'OVERVIEW', items: [
        { id: 'dash', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'rekap', label: 'Rekapitulasi', icon: <History size={18} /> },
      ]},
      { section: 'ANALISIS', items: [
        { id: 'inflasi', label: 'Inflasi & Tren', icon: <TrendingUp size={18} /> },
        { id: 'stok', label: 'Data Stok', icon: <Box size={18} /> },
      ]},
      { section: 'KETERSEDIAAN', items: [
        { id: 'ketersediaan', label: 'Ketersediaan Bahan Pokok', icon: <Package size={18} /> },
      ]},
      { section: 'PUBLIKASI', items: [
        { id: 'publikasi', label: 'Publikasi Data', icon: <Megaphone size={18} /> },
        { id: 'laporan', label: 'Export Laporan', icon: <FileText size={18} /> },
      ]}
    ]
  };

  const currentMenus = menuConfig[user.role] || menuConfig.enumerator;

  // Filter pasar based on enumerator work area
  const myPasar = user.role === 'enumerator' && user.pasar_ids 
    ? pasar.filter(p => user.pasar_ids.split(',').includes(p.id.toString()))
    : pasar;

  const getPageTitle = () => {
    for (const section of currentMenus) {
      const item = section.items.find(i => i.id === activeTab);
      if (item) return item.label;
    }
    return 'Dashboard';
  };

  const chartData = {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    datasets: [{
      label: 'Survey Selesai',
      data: [12, 15, 10, 18, 20, 15, 22],
      borderColor: '#00d4aa',
      backgroundColor: 'rgba(0, 212, 170, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const roleColors = {
    enumerator: 'linear-gradient(135deg,#0099ff,#00d4aa)',
    dinas: 'linear-gradient(135deg,#ffb700,#ff6b35)',
    admin: 'linear-gradient(135deg,#ff6b35,#ff4466)'
  };

  return (
    <div className="app-wrap">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="s-logo-row">
            <div className="s-logo-icon">🏪</div>
            <div className="s-logo-text">SIPANTAR</div>
          </div>
          <div className="s-logo-sub">MONITORING HARGA PASAR</div>
        </div>
        
        <nav className="sidebar-nav">
          {currentMenus.map((section, idx) => (
            <div key={idx} className="nav-section">
              <div className="nav-section-label">{section.section}</div>
              {section.items.map(item => (
                <button 
                  key={item.id} 
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="ni">{item.icon}</span>
                  {item.label}
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                  {item.pill && <span className="nav-pill">{item.pill}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="su-avatar" style={{ background: roleColors[user.role] || 'var(--accent2)' }}>
            {user.nama.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="su-name">{user.nama}</div>
            <div className="su-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <div className="topbar">
          <div>
            <div className="page-title-main">{getPageTitle()}</div>
            <div className="page-sub-main">
              {activeTab === 'dash' ? 'Ringkasan aktivitas dan harga hari ini' : `Manajemen ${getPageTitle()}`}
            </div>
          </div>
          <div className="topbar-right">
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('input')}>+ Input Harga</button>
            <button className="btn btn-secondary btn-sm" onClick={onLogout}>
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </div>

        <div className="content-area">
          {activeTab === 'dash' && (
            <>
              <div className="stats-grid">
                {user.role === 'enumerator' ? (
                  <>
                    <div className="stat-card sc-green">
                      <div className="sc-icon">📝</div>
                      <div className="sc-label">INPUT HARI INI</div>
                      <div className="sc-val" style={{ color: 'var(--accent)' }}>12</div>
                      <div className="sc-change up">▲ 3 lebih dari kemarin</div>
                    </div>
                    <div className="stat-card sc-blue">
                      <div className="sc-icon">🏪</div>
                      <div className="sc-label">PASAR TUGAS</div>
                      <div className="sc-val" style={{ color: 'var(--accent2)' }}>2</div>
                      <div className="sc-change">Pasar A & B</div>
                    </div>
                    <div className="stat-card sc-yellow">
                      <div className="sc-icon">👤</div>
                      <div className="sc-label">PEDAGANG TARGET</div>
                      <div className="sc-val" style={{ color: 'var(--warn)' }}>8</div>
                      <div className="sc-change">5 Selesai</div>
                    </div>
                    <div className="stat-card sc-orange">
                      <div className="sc-icon">⏱️</div>
                      <div className="sc-label">TERAKHIR SUBMIT</div>
                      <div className="sc-val" style={{ color: 'var(--accent3)', fontSize: '18px' }}>10:32</div>
                      <div className="sc-change">WIB</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="stat-card sc-green">
                      <div className="sc-icon">🏪</div>
                      <div className="sc-label">PASAR AKTIF</div>
                      <div className="sc-val" style={{ color: 'var(--accent)' }}>{pasar.length}</div>
                      <div className="sc-change">Beroperasi Normal</div>
                    </div>
                    <div className="stat-card sc-blue">
                      <div className="sc-icon">📊</div>
                      <div className="sc-label">KOMODITAS</div>
                      <div className="sc-val" style={{ color: 'var(--accent2)' }}>{komoditas.length}</div>
                      <div className="sc-change">100% Coverage</div>
                    </div>
                    <div className="stat-card sc-yellow">
                      <div className="sc-icon">📈</div>
                      <div className="sc-label">INFLASI MoM</div>
                      <div className="sc-val" style={{ color: 'var(--warn)' }}>2.3%</div>
                      <div className="sc-change up">▲ +0.4%</div>
                    </div>
                    <div className="stat-card sc-red">
                      <div className="sc-icon">⚠️</div>
                      <div className="sc-label">WASPADA</div>
                      <div className="sc-val" style={{ color: 'var(--danger)' }}>3</div>
                      <div className="sc-change">Harga Tinggi</div>
                    </div>
                  </>
                )}
              </div>

              <div className="grid3">
                <div className="card">
                  <div className="card-head">
                    <div>
                      <div className="card-title">Tren Harga Minggu Ini</div>
                      <div className="card-sub">5 komoditas utama</div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div style={{ height: '210px' }}>
                      <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">Aktivitas Terakhir</div>
                  </div>
                  <div className="card-body" style={{ padding: '0' }}>
                    {logs.slice(0, 5).map(log => (
                      <div key={log.id} style={{ padding: '12px 15px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '700' }}>{log.waktu} WIB</span>
                          <span style={{ fontSize: '10px', color: 'var(--text3)' }}>@{log.username}</span>
                        </div>
                        <div style={{ fontSize: '13px' }}>{log.aksi}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{log.pasar_nama || 'Semua Pasar'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'input' && (
            <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
              <div className="card-head">Form Input Survey Harga</div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Pasar</label>
                      <select 
                        value={formData.pasar_id} 
                        onChange={(e) => setFormData({ ...formData, pasar_id: e.target.value, pedagang_id: '' })}
                        required
                      >
                        <option value="">Pilih Pasar...</option>
                        {myPasar.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Pedagang</label>
                      <select 
                        value={formData.pedagang_id} 
                        onChange={(e) => setFormData({ ...formData, pedagang_id: e.target.value })}
                        required
                        disabled={!formData.pasar_id}
                      >
                        <option value="">Pilih Pedagang...</option>
                        {pedagang
                          .filter(p => p.pasar_id === parseInt(formData.pasar_id))
                          .map(p => <option key={p.id} value={p.id}>{p.nama} ({p.lapak})</option>)
                        }
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Komoditas</label>
                      <select 
                        value={formData.komoditas_id} 
                        onChange={(e) => setFormData({ ...formData, komoditas_id: e.target.value })}
                        required
                      >
                        <option value="">Pilih Komoditas...</option>
                        {komoditas.map(k => <option key={k.id} value={k.id}>{k.nama} ({k.satuan})</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Harga per Satuan (Rp)</label>
                      <input 
                        type="number" 
                        placeholder="Contoh: 12500" 
                        value={formData.harga} 
                        onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Catatan Survey</label>
                    <textarea placeholder="Kondisi stok, kualitas barang, atau alasan perubahan harga signifikan..."></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" className="btn btn-secondary btn-full" onClick={() => setActiveTab('dash')}>Batal</button>
                    <button type="submit" className="btn btn-primary btn-full">💾 Simpan Survey Harga</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">Daftar Pengguna Sistem</div>
                <button className="btn btn-primary btn-sm" onClick={() => openModal('users')}>+ Tambah User</button>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>NAMA LENGKAP</th>
                      <th>USERNAME</th>
                      <th>ROLE</th>
                      <th>STATUS</th>
                      <th>LOGIN TERAKHIR</th>
                      <th>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: '600' }}>
                          {u.nama}
                          {u.role === 'enumerator' && u.pasar_ids && (
                            <div style={{ fontSize: '10px', color: 'var(--accent)', marginTop: '2px' }}>
                              📍 {u.pasar_ids.split(',').length} Pasar: {
                                u.pasar_ids.split(',').map(id => pasar.find(p => p.id.toString() === id)?.nama.replace('Pasar ', '')).join(', ')
                              }
                            </div>
                          )}
                        </td>
                        <td style={{ fontFamily: 'var(--mono)' }}>{u.username}</td>
                        <td>
                          <span className={`badge badge-${u.role === 'admin' ? 'orange' : u.role === 'dinas' ? 'yellow' : 'blue'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.status === 'aktif' ? 'badge-green' : 'badge-red'}`}>
                            {u.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text2)', fontSize: '11px' }}>{u.last_login}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openModal('users', u)}>✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete('users', u.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'manPasar' && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">Data Pasar Tradisional</div>
                <button className="btn btn-primary btn-sm" onClick={() => openModal('pasar')}>+ Tambah Pasar</button>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ICON</th>
                      <th>NAMA PASAR</th>
                      <th>KODE</th>
                      <th>ALAMAT</th>
                      <th>JAM OPERASIONAL</th>
                      <th>PEDAGANG</th>
                      <th>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pasar.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontSize: '20px' }}>{p.icon}</td>
                        <td style={{ fontWeight: '600' }}>{p.nama}</td>
                        <td style={{ fontFamily: 'var(--mono)' }}>{p.kode}</td>
                        <td>{p.alamat}</td>
                        <td>{p.jam_operasional}</td>
                        <td>{p.pedagang_count}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openModal('pasar', p)}>✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete('pasar', p.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'manKomoditas' && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">Daftar Komoditas Dipantau</div>
                <button className="btn btn-primary btn-sm" onClick={() => openModal('komoditas')}>+ Tambah Komoditas</button>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>NAMA KOMODITAS</th>
                      <th>KATEGORI</th>
                      <th>SATUAN</th>
                      <th>HARGA DASAR</th>
                      <th>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {komoditas.map(k => (
                      <tr key={k.id}>
                        <td>#{k.id}</td>
                        <td style={{ fontWeight: '600' }}>{k.nama}</td>
                        <td><span className="badge badge-gray">{k.kategori}</span></td>
                        <td>{k.satuan}</td>
                        <td className="price">Rp {k.harga_base.toLocaleString('id-ID')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openModal('komoditas', k)}>✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete('komoditas', k.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'manPedagang' && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">Master Data Pedagang</div>
                <button className="btn btn-primary btn-sm" onClick={() => openModal('pedagang')}>+ Tambah Pedagang</button>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>NAMA PEDAGANG</th>
                      <th>PASAR</th>
                      <th>LAPAK</th>
                      <th>KOMODITAS</th>
                      <th>STATUS</th>
                      <th>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedagang
                      .filter(p => user.role !== 'enumerator' || (user.pasar_ids && user.pasar_ids.split(',').includes(p.pasar_id.toString())))
                      .map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: '600' }}>{p.nama}</td>
                        <td>{p.pasar_nama}</td>
                        <td>{p.lapak}</td>
                        <td style={{ fontSize: '11px', color: 'var(--text2)' }}>{p.komoditas_list}</td>
                        <td>
                          <span className={`badge ${p.status === 'aktif' ? 'badge-green' : 'badge-red'}`}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openModal('pedagang', p)}>✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete('pedagang', p.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'riwayat' && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">Riwayat Input Saya</div>
                <button className="btn btn-secondary btn-sm">⬇ Export</button>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>TANGGAL</th>
                      <th>PASAR</th>
                      <th>PEDAGANG</th>
                      <th>JML KOMODITAS</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length > 0 ? (
                      history.map((h, i) => (
                        <tr key={i}>
                          <td style={{ fontFamily: 'var(--mono)', fontSize: '11.5px' }}>
                            {new Date(h.tanggal).toLocaleDateString('id-ID')}
                          </td>
                          <td>{h.pasar_nama}</td>
                          <td>{h.pedagang_nama}</td>
                          <td>
                            <span className="badge badge-blue">{h.jml_komoditas} komoditas</span>
                          </td>
                          <td>
                            <span className="badge badge-green">✓ Terkirim</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)' }}>
                          Belum ada riwayat input.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'listPedagang' && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">Pedagang di Pasar Tugasmu</div>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>NAMA</th>
                      <th>PASAR</th>
                      <th>LAPAK</th>
                      <th>KOMODITAS</th>
                      <th>STATUS SURVEY</th>
                      <th>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedagang
                      .filter(p => user.role !== 'enumerator' || (user.pasar_ids && user.pasar_ids.split(',').includes(p.pasar_id.toString())))
                      .map((p, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '600' }}>{p.nama}</td>
                        <td>{p.pasar_nama}</td>
                        <td><span className="badge badge-blue">{p.lapak}</span></td>
                        <td style={{ fontSize: '11.5px', color: 'var(--text2)' }}>{p.komoditas_list}</td>
                        <td>
                          {Math.random() > 0.4 ? (
                            <span className="badge badge-green">✓ Sudah</span>
                          ) : (
                            <span className="badge badge-yellow">Belum</span>
                          )}
                        </td>
                        <td>
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => {
                              setFormData({ ...formData, pasar_id: p.pasar_id, pedagang_id: p.id });
                              setActiveTab('input');
                            }}
                          >
                            Input Harga
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'rekap' && (
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Rekapitulasi Harga Pasar</div>
                  <div className="card-sub">Rata-rata harga harian per komoditas</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                    <option>Semua Kategori</option>
                  </select>
                  <button className="btn btn-blue btn-sm">⬇ Download Excel</button>
                </div>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>KOMODITAS</th>
                      <th>/SAT</th>
                      {pasar.map(p => <th key={p.id}>{p.nama.replace('Pasar ', '')}</th>)}
                      <th>RATA-RATA</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {komoditas.map(k => {
                      const prices = rekap.filter(r => r.komoditas_id === k.id);
                      const avg = prices.reduce((acc, p) => acc + (p.avg_harga || 0), 0) / prices.filter(p => p.avg_harga).length || 0;
                      return (
                        <tr key={k.id}>
                          <td style={{ fontWeight: '600' }}>{k.nama}</td>
                          <td style={{ color: 'var(--text3)', fontSize: '11px' }}>{k.satuan}</td>
                          {pasar.map(p => {
                            const price = prices.find(pr => pr.pasar_id === p.id);
                            return (
                              <td key={p.id} className="price">
                                {price && price.avg_harga ? `Rp ${price.avg_harga.toLocaleString('id-ID')}` : '-'}
                              </td>
                            );
                          })}
                          <td className="price" style={{ color: 'var(--accent)' }}>
                            {avg ? `Rp ${Math.round(avg).toLocaleString('id-ID')}` : '-'}
                          </td>
                          <td><span className="badge badge-green">STABIL</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'inflasi' && (
            <>
              <div className="stats-grid">
                <div className="stat-card sc-green">
                  <div className="sc-label">INFLASI BULAN INI (MoM)</div>
                  <div className="sc-val">+2.3%</div>
                  <div className="sc-change up">▲ 0.4% dari bulan lalu</div>
                </div>
                <div className="stat-card sc-blue">
                  <div className="sc-label">INFLASI TAHUNAN (YoY)</div>
                  <div className="sc-val">4.1%</div>
                  <div className="sc-change up">▲ Sesuai target nasional</div>
                </div>
                <div className="stat-card sc-yellow">
                  <div className="sc-label">KOMODITAS PENYUMBANG</div>
                  <div className="sc-val" style={{ fontSize: '18px' }}>Cabai Merah</div>
                  <div className="sc-change">Andil +0.12%</div>
                </div>
                <div className="stat-card sc-orange">
                  <div className="sc-label">DEFLASI TERBANYAK</div>
                  <div className="sc-val" style={{ fontSize: '18px' }}>Daging Ayam</div>
                  <div className="sc-change">Andil -0.05%</div>
                </div>
              </div>
              <div className="grid2">
                <div className="card">
                  <div className="card-head"><div className="card-title">Tren Inflasi 6 Bulan Terakhir</div></div>
                  <div className="card-body">
                    <div style={{ height: '250px' }}>
                      <Line 
                        data={{
                          labels: ['Sep', 'Okt', 'Nov', 'Des', 'Jan', 'Feb'],
                          datasets: [{
                            label: 'Inflasi (%)',
                            data: [1.8, 2.1, 2.5, 3.2, 2.8, 2.3],
                            borderColor: 'var(--accent)',
                            backgroundColor: 'rgba(0, 212, 170, 0.1)',
                            fill: true,
                            tension: 0.4
                          }]
                        }} 
                        options={{ maintainAspectRatio: false }}
                      />
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-head"><div className="card-title">Perbandingan Inflasi per Pasar</div></div>
                  <div className="card-body">
                    <div style={{ height: '250px' }}>
                      <Line 
                        data={{
                          labels: pasar.map(p => p.nama.replace('Pasar ', '')),
                          datasets: [{
                            label: 'Tingkat Harga (%)',
                            data: [2.1, 2.5, 1.9, 2.4, 2.2],
                            borderColor: 'var(--accent2)',
                            backgroundColor: 'rgba(0, 153, 255, 0.1)',
                            fill: true,
                            tension: 0.4
                          }]
                        }} 
                        options={{ maintainAspectRatio: false }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'stok' && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">Ketersediaan Stok Komoditas</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {pasar.map(p => (
                    <button key={p.id} className="btn btn-ghost btn-sm" style={{ fontSize: '10px' }}>{p.nama}</button>
                  ))}
                </div>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>KOMODITAS</th>
                      <th>EST. STOK (TON)</th>
                      <th>KETERSEDIAAN</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {komoditas.slice(0, 10).map(k => (
                      <tr key={k.id}>
                        <td style={{ fontWeight: '600' }}>{k.nama}</td>
                        <td className="price">{(Math.random() * 50 + 10).toFixed(1)}</td>
                        <td>
                          <div style={{ width: '100px', height: '6px', background: 'var(--bg3)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.random() * 60 + 40}%`, height: '100%', background: 'var(--accent)' }}></div>
                          </div>
                        </td>
                        <td><span className="badge badge-green">AMAN</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'log' && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">Log Aktivitas Sistem</div>
                <button className="btn btn-secondary btn-sm">🧹 Bersihkan Log</button>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>WAKTU</th>
                      <th>PENGGUNA</th>
                      <th>AKTIVITAS</th>
                      <th>LOKASI/PASAR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: '11.5px' }}>{log.waktu}</td>
                        <td>
                          <div style={{ fontWeight: '600' }}>@{log.username}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{log.role}</div>
                        </td>
                        <td>{log.aksi}</td>
                        <td>{log.pasar_nama || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid2">
              <div className="card">
                <div className="card-head"><div className="card-title">Pengaturan Sambutan Kepala Dinas</div></div>
                <div className="card-body">
                  <form onSubmit={handleKadisUpdate}>
                    <div className="form-group">
                      <label>Foto Kepala Dinas (URL)</label>
                      <input 
                        type="text" 
                        value={kadisData.kadis_foto || ''}
                        onChange={(e) => setKadisData({...kadisData, kadis_foto: e.target.value})}
                        placeholder="https://example.com/foto.jpg"
                      />
                    </div>
                    <div className="form-group">
                      <label>Nama Kepala Dinas</label>
                      <input 
                        type="text" 
                        value={kadisData.kadis_nama || ''}
                        onChange={(e) => setKadisData({...kadisData, kadis_nama: e.target.value})}
                        placeholder="Ir. H. Slamet Raharjo, M.Si"
                      />
                    </div>
                    <div className="form-group">
                      <label>Jabatan</label>
                      <input 
                        type="text" 
                        value={kadisData.kadis_jabatan || ''}
                        onChange={(e) => setKadisData({...kadisData, kadis_jabatan: e.target.value})}
                        placeholder="Kepala Dinas Ketahanan Pangan, Pertanian dan Perikanan Kota Tasikmalaya"
                      />
                    </div>
                    <div className="form-group">
                      <label>Sambutan</label>
                      <textarea 
                        value={kadisData.kadis_sambutan || ''}
                        onChange={(e) => setKadisData({...kadisData, kadis_sambutan: e.target.value})}
                        placeholder="Tuliskan sambutan kepala dinas..."
                        rows="4"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
                  </form>
                </div>
              </div>
              <div className="card">
                <div className="card-head"><div className="card-title">Pengaturan Profil</div></div>
                <div className="card-body">
                  <form>
                    <div className="form-group">
                      <label>Nama Lengkap</label>
              {showModal === 'ketersediaan' && (
                <div className="modal-overlay show">
                  <div className="modal">
                    <div className="modal-head">
                      <div className="modal-title">{editItem ? '✏️ Edit Ketersediaan' : '📦 Tambah Ketersediaan'}</div>
                      <button className="mclose" onClick={() => setShowModal(null)}>✕</button>
                    </div>
                    <form onSubmit={(e) => handleCrudSubmit(e, 'ketersediaan')}>
                      <div className="modal-body">
                        <div className="form-group">
                          <label>Komoditas</label>
                          <select value={modalData.komoditas_id || ''} onChange={(e) => setModalData({ ...modalData, komoditas_id: e.target.value })} required>
                            <option value="">Pilih Komoditas...</option>
                            {komoditas.map(k => <option key={k.id} value={k.id}>{k.nama} ({k.satuan})</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Pasar</label>
                          <select value={modalData.pasar_id || ''} onChange={(e) => setModalData({ ...modalData, pasar_id: e.target.value })} required>
                            <option value="">Pilih Pasar...</option>
                            {myPasar.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                          </select>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Ketersediaan (%)</label>
                            <input type="number" min="0" max="100" value={modalData.ketersediaan || 100} onChange={(e) => setModalData({ ...modalData, ketersediaan: e.target.value })} required />
                          </div>
                          <div className="form-group">
                            <label>Status</label>
                            <select value={modalData.status || 'Tersedia'} onChange={(e) => setModalData({ ...modalData, status: e.target.value })} required>
                              <option value="Tersedia">Tersedia</option>
                              <option value="Terbatas">Terbatas</option>
                              <option value="Langka">Langka</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="modal-foot">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>Batal</button>
                        <button type="submit" className="btn btn-primary">Simpan</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
                      <input type="text" defaultValue={user.nama} />
                    </div>
                    <div className="form-group">
                      <label>Username</label>
                      <input type="text" defaultValue={user.username} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Password Baru</label>
                      <input type="password" placeholder="Kosongkan jika tidak diubah" />
                    </div>
                    <button type="button" className="btn btn-primary">Simpan Perubahan</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'publikasi' && (
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Publikasi Data Harga</div>
                  <div className="card-sub">Kelola data yang ditampilkan di portal publik</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handlePublish}>🚀 Publikasikan Sekarang</button>
              </div>
              <div className="card-body">
                <div className="pub-alert-banner warn" style={{ borderRadius: '8px', marginBottom: '20px' }}>
                  <div className="pub-ab-icon">📢</div>
                  <div className="pub-ab-text">
                    <div className="pub-ab-title">Status Publikasi Terakhir</div>
                    Data harga hari ini telah diperbarui {lastPublish}. Klik tombol di atas untuk sinkronisasi ulang ke portal publik.
                  </div>
                </div>
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>TANGGAL</th>
                        <th>TOTAL INPUT</th>
                        <th>PASAR TERCOVER</th>
                        <th>PUBLIKATOR</th>
                        <th>STATUS</th>
                        <th>AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontFamily: 'var(--mono)' }}>{new Date().toLocaleDateString('id-ID')}</td>
                        <td>{rekap.filter(r => r.avg_harga).length} data</td>
                        <td>{pasar.length}/{pasar.length}</td>
                        <td>Ir. Budi Santoso, MM</td>
                        <td><span className="badge badge-green">PUBLISHED</span></td>
                        <td><button className="btn btn-ghost btn-sm">Lihat</button></td>
                      </tr>
                      <tr>
                        <td style={{ fontFamily: 'var(--mono)' }}>{new Date(Date.now() - 86400000).toLocaleDateString('id-ID')}</td>
                        <td>90 data</td>
                        <td>5/5</td>
                        <td>Ir. Budi Santoso, MM</td>
                        <td><span className="badge badge-gray">ARCHIVED</span></td>
                        <td><button className="btn btn-ghost btn-sm">Lihat</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'laporan' && (
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Export Laporan Harga</div>
                  <div className="card-sub">Generate laporan periodik dalam format PDF atau Excel</div>
                </div>
              </div>
              <div className="card-body">
                <div className="grid2" style={{ gap: '24px' }}>
                  <div className="form-container">
                    <h4 style={{ marginBottom: '16px', fontSize: '14px' }}>Konfigurasi Laporan</h4>
                    <div className="form-group">
                      <label>Jenis Laporan</label>
                      <select 
                        value={reportConfig.type} 
                        onChange={(e) => setReportConfig({ ...reportConfig, type: e.target.value })}
                      >
                        <option>Laporan Harian Komoditas</option>
                        <option>Laporan Mingguan Tren Harga</option>
                        <option>Laporan Bulanan Inflasi</option>
                        <option>Laporan Perbandingan Antar Pasar</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Dari Tanggal</label>
                        <input 
                          type="date" 
                          value={reportConfig.from} 
                          onChange={(e) => setReportConfig({ ...reportConfig, from: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Sampai Tanggal</label>
                        <input 
                          type="date" 
                          value={reportConfig.to} 
                          onChange={(e) => setReportConfig({ ...reportConfig, to: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Pilih Pasar</label>
                      <select 
                        value={reportConfig.pasar_id} 
                        onChange={(e) => setReportConfig({ ...reportConfig, pasar_id: e.target.value })}
                      >
                        <option value="all">Semua Pasar</option>
                        {pasar.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button className="btn btn-blue btn-full" onClick={handleGeneratePreview}>📊 Generate Preview</button>
                      <button className="btn btn-primary btn-full" onClick={handleDownloadReport}>📥 Download Report</button>
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg2)', borderRadius: '12px', padding: '20px', border: '1px dashed var(--border)', display: reportPreview ? 'block' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: reportPreview ? 'left' : 'center', minHeight: '300px' }}>
                    {reportPreview ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                          <div style={{ fontSize: '24px' }}>📄</div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '14px' }}>{reportPreview.title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text2)' }}>Periode: {reportPreview.date} • {reportPreview.pasar}</div>
                          </div>
                        </div>
                        <table style={{ width: '100%', fontSize: '11px' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '5px' }}>KOMODITAS</th>
                              <th style={{ padding: '5px' }}>HARGA</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportPreview.data.map(item => (
                              <tr key={item.id}>
                                <td style={{ padding: '5px' }}>{item.nama}</td>
                                <td style={{ padding: '5px' }} className="price">Rp {item.harga_base.toLocaleString('id-ID')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{ marginTop: '15px', fontSize: '10px', color: 'var(--text3)', fontStyle: 'italic', textAlign: 'center' }}>
                          * Menampilkan 8 baris pertama sebagai preview.
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>📄</div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Preview Laporan</div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Pilih konfigurasi di samping untuk melihat preview laporan yang akan diunduh.</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ketersediaan' && (
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Ketersediaan Bahan Pokok</div>
                  <div className="card-sub">Kelola data ketersediaan bahan pokok di pasar-pasar</div>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowModal('ketersediaan'); setEditItem(null); setModalData({}); }}>
                  <Plus size={16} /> Tambah Data
                </button>
              </div>
              <div className="card-body">
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Komoditas</th>
                        <th>Pasar</th>
                        <th>Ketersediaan</th>
                        <th>Status</th>
                        <th>Update</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ketersediaanData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.nama_komoditas}</td>
                          <td>{item.nama_pasar}</td>
                          <td>
                            <div style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              width: '50px',
                              height: '50px',
                              borderRadius: '50%',
                              background: item.ketersediaan >= 80 ? '#dcfce7' : item.ketersediaan >= 50 ? '#fef3c7' : '#fee2e2',
                              color: item.ketersediaan >= 80 ? '#166534' : item.ketersediaan >= 50 ? '#92400e' : '#991b1b',
                              fontWeight: '700',
                              fontSize: '12px'
                            }}>
                              {item.ketersediaan}%
                            </div>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              background: item.ketersediaan >= 80 ? '#dcfce7' : item.ketersediaan >= 50 ? '#fef3c7' : '#fee2e2',
                              color: item.ketersediaan >= 80 ? '#166534' : item.ketersediaan >= 50 ? '#92400e' : '#991b1b'
                            }}>
                              {item.ketersediaan >= 80 ? 'Tersedia' : item.ketersediaan >= 50 ? 'Terbatas' : 'Langka'}
                            </span>
                          </td>
                          <td>{new Date(item.updated_at).toLocaleDateString('id-ID')}</td>
                          <td>
                            <div className="btn-group">
                              <button className="btn btn-ghost btn-sm" onClick={() => { setShowModal('ketersediaan'); setEditItem(item); setModalData(item); }}>
                                Edit
                              </button>
                              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete('ketersediaan', item.id)}>
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!['dash', 'input', 'users', 'manPasar', 'manKomoditas', 'manPedagang', 'riwayat', 'listPedagang', 'rekap', 'inflasi', 'stok', 'log', 'settings', 'publikasi', 'laporan', 'ketersediaan'].includes(activeTab) && (
            <div className="empty">
              <div className="empty-icon">🚧</div>
              <div className="empty-text">Halaman {getPageTitle()} dalam pengembangan</div>
              <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '10px' }}>
                Fitur ini akan segera tersedia pada pembaruan berikutnya.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* CRUD MODALS */}
      {showModal === 'users' && (
        <div className="modal-overlay show">
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">{editItem ? '✏️ Edit Pengguna' : '👤 Tambah Pengguna'}</div>
              <button className="mclose" onClick={() => setShowModal(null)}>✕</button>
            </div>
            <form onSubmit={(e) => handleCrudSubmit(e, 'users')}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={modalData.nama || ''} 
                    onChange={(e) => setModalData({ ...modalData, nama: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    value={modalData.username || ''} 
                    onChange={(e) => setModalData({ ...modalData, username: e.target.value })}
                    required
                  />
                </div>
                {!editItem && (
                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password" 
                      onChange={(e) => setModalData({ ...modalData, password: e.target.value })}
                      required
                    />
                  </div>
                )}
                <div className="form-row">
                  <div className="form-group">
                    <label>Role</label>
                    <select 
                      value={modalData.role || ''} 
                      onChange={(e) => setModalData({ ...modalData, role: e.target.value, pasar_ids: e.target.value === 'enumerator' ? modalData.pasar_ids : null })}
                      required
                    >
                      <option value="">Pilih Role...</option>
                      <option value="admin">Administrator</option>
                      <option value="dinas">Dinas</option>
                      <option value="enumerator">Enumerator</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select 
                      value={modalData.status || 'aktif'} 
                      onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
                      required
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>
                {modalData.role === 'enumerator' && (
                  <div className="form-group">
                    <label>Wilayah Kerja (Pilih Pasar)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', background: 'var(--bg2)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      {pasar.map(p => {
                        const selectedIds = modalData.pasar_ids ? modalData.pasar_ids.split(',') : [];
                        const isChecked = selectedIds.includes(p.id.toString());
                        return (
                          <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', marginBottom: 0 }}>
                            <input 
                              type="checkbox" 
                              style={{ width: 'auto' }}
                              checked={isChecked}
                              onChange={(e) => {
                                let newIds = [...selectedIds];
                                if (e.target.checked) {
                                  newIds.push(p.id.toString());
                                } else {
                                  newIds = newIds.filter(id => id !== p.id.toString());
                                }
                                setModalData({ ...modalData, pasar_ids: newIds.join(',') });
                              }}
                            />
                            {p.icon} {p.nama}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'pasar' && (
        <div className="modal-overlay show">
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">{editItem ? '✏️ Edit Pasar' : '🏪 Tambah Pasar'}</div>
              <button className="mclose" onClick={() => setShowModal(null)}>✕</button>
            </div>
            <form onSubmit={(e) => handleCrudSubmit(e, 'pasar')}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nama Pasar</label>
                    <input 
                      type="text" 
                      value={modalData.nama || ''} 
                      onChange={(e) => setModalData({ ...modalData, nama: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Kode Pasar</label>
                    <input 
                      type="text" 
                      value={modalData.kode || ''} 
                      onChange={(e) => setModalData({ ...modalData, kode: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Alamat</label>
                  <input 
                    type="text" 
                    value={modalData.alamat || ''} 
                    onChange={(e) => setModalData({ ...modalData, alamat: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Jam Operasional</label>
                    <input 
                      type="text" 
                      value={modalData.jam_operasional || ''} 
                      onChange={(e) => setModalData({ ...modalData, jam_operasional: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Icon (Emoji)</label>
                    <input 
                      type="text" 
                      value={modalData.icon || '🏪'} 
                      onChange={(e) => setModalData({ ...modalData, icon: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'komoditas' && (
        <div className="modal-overlay show">
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">{editItem ? '✏️ Edit Komoditas' : '🧺 Tambah Komoditas'}</div>
              <button className="mclose" onClick={() => setShowModal(null)}>✕</button>
            </div>
            <form onSubmit={(e) => handleCrudSubmit(e, 'komoditas')}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nama Komoditas</label>
                  <input 
                    type="text" 
                    value={modalData.nama || ''} 
                    onChange={(e) => setModalData({ ...modalData, nama: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Kategori</label>
                    <select 
                      value={modalData.kategori || ''} 
                      onChange={(e) => setModalData({ ...modalData, kategori: e.target.value })}
                      required
                    >
                      <option value="">Pilih Kategori...</option>
                      <option value="Beras">Beras</option>
                      <option value="Sayuran">Sayuran</option>
                      <option value="Daging">Daging</option>
                      <option value="Bumbu">Bumbu</option>
                      <option value="Minyak">Minyak</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Satuan</label>
                    <input 
                      type="text" 
                      value={modalData.satuan || ''} 
                      onChange={(e) => setModalData({ ...modalData, satuan: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Harga Dasar (Rp)</label>
                  <input 
                    type="number" 
                    value={modalData.harga_base || ''} 
                    onChange={(e) => setModalData({ ...modalData, harga_base: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'pedagang' && (
        <div className="modal-overlay show">
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">{editItem ? '✏️ Edit Pedagang' : '👤 Tambah Pedagang'}</div>
              <button className="mclose" onClick={() => setShowModal(null)}>✕</button>
            </div>
            <form onSubmit={(e) => handleCrudSubmit(e, 'pedagang')}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nama Pedagang</label>
                  <input 
                    type="text" 
                    value={modalData.nama || ''} 
                    onChange={(e) => setModalData({ ...modalData, nama: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Pasar</label>
                    <select 
                      value={modalData.pasar_id || ''} 
                      onChange={(e) => setModalData({ ...modalData, pasar_id: e.target.value })}
                      required
                    >
                      <option value="">Pilih Pasar...</option>
                      {myPasar.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Lapak</label>
                    <input 
                      type="text" 
                      value={modalData.lapak || ''} 
                      onChange={(e) => setModalData({ ...modalData, lapak: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Nomor Telepon</label>
                  <input 
                    type="text" 
                    value={modalData.telp || ''} 
                    onChange={(e) => setModalData({ ...modalData, telp: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Komoditas List (Pisahkan dengan koma)</label>
                  <input 
                    type="text" 
                    value={modalData.komoditas_list || ''} 
                    onChange={(e) => setModalData({ ...modalData, komoditas_list: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={modalData.status || 'aktif'} 
                    onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
                    required
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalApp;
