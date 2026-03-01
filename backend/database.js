const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'sipantar.db');
console.log('Opening SQLite DB at', dbPath, 'exists=', fs.existsSync(dbPath));
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open SQLite DB:', err.message);
  } else {
    console.log('SQLite DB opened successfully');
  }
});

db.serialize(() => {
  // Komoditas Table
  db.run(`CREATE TABLE IF NOT EXISTS komoditas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    satuan TEXT NOT NULL,
    kategori TEXT NOT NULL,
    harga_base INTEGER NOT NULL
  )`);

  // Pasar Table
  db.run(`CREATE TABLE IF NOT EXISTS pasar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    kode TEXT NOT NULL,
    alamat TEXT,
    jam_operasional TEXT,
    icon TEXT,
    pedagang_count INTEGER DEFAULT 0
  )`);

  // Pedagang Table
  db.run(`CREATE TABLE IF NOT EXISTS pedagang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    pasar_id INTEGER,
    lapak TEXT,
    telp TEXT,
    komoditas_list TEXT,
    status TEXT DEFAULT 'aktif',
    FOREIGN KEY(pasar_id) REFERENCES pasar(id)
  )`);

  // Harga Table (Survey Data)
  db.run(`CREATE TABLE IF NOT EXISTS harga (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    komoditas_id INTEGER,
    pasar_id INTEGER,
    pedagang_id INTEGER,
    harga INTEGER NOT NULL,
    tanggal DATE DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(komoditas_id) REFERENCES komoditas(id),
    FOREIGN KEY(pasar_id) REFERENCES pasar(id),
    FOREIGN KEY(pedagang_id) REFERENCES pedagang(id)
  )`);

  // Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'aktif',
    last_login TEXT,
    pasar_ids TEXT -- Store comma separated IDs for enumerators
  )`);

  // Audit Logs Table
  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waktu TEXT,
    aksi TEXT,
    user_id INTEGER,
    pasar_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Settings Table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);

  // Ketersediaan Bahan Pokok Table
  db.run(`CREATE TABLE IF NOT EXISTS ketersediaan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    komoditas_id INTEGER,
    pasar_id INTEGER,
    ketersediaan INTEGER DEFAULT 100,
    status TEXT DEFAULT 'Tersedia',
    updated_at DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY(komoditas_id) REFERENCES komoditas(id),
    FOREIGN KEY(pasar_id) REFERENCES pasar(id)
  )`);

  // Clear existing data for fresh seed (as requested for audit)
  db.run("DELETE FROM harga");
  db.run("DELETE FROM logs");
  db.run("DELETE FROM pedagang");
  db.run("DELETE FROM pasar");
  db.run("DELETE FROM komoditas");
  db.run("DELETE FROM users");
  db.run("DELETE FROM settings");

  // --- SEED DATA FROM HTML ---

  // 0. Settings
  const settingsData = [
    ['kadis_nama', 'Dr. Ir. H. Ahmad Rahman, M.Si'],
    ['kadis_jabatan', 'Kepala Dinas Ketahanan Pangan, Pertanian dan Perikanan Kota Tasikmalaya'],
    ['kadis_sambutan', 'Kami berkomitmen untuk terus menyajikan data harga komoditas yang akurat dan transparan bagi masyarakat. Portal ini hadir sebagai wujud transparansi pemerintah dalam menyediakan informasi harga yang dapat diandalkan.'],
    ['kadis_foto', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad']
  ];
  const stmtSettings = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
  settingsData.forEach(d => stmtSettings.run(d));
  stmtSettings.finalize();

  // 1. Komoditas
  const komoData = [
    ['Beras Medium', 'kg', 'Beras', 12500],
    ['Beras Premium', 'kg', 'Beras', 15000],
    ['Cabai Merah', 'kg', 'Sayuran', 45000],
    ['Cabai Rawit', 'kg', 'Sayuran', 58000],
    ['Bawang Merah', 'kg', 'Bumbu', 38000],
    ['Bawang Putih', 'kg', 'Bumbu', 32000],
    ['Minyak Goreng', 'liter', 'Minyak', 17000],
    ['Gula Pasir', 'kg', 'Gula', 14000],
    ['Tepung Terigu', 'kg', 'Bahan Pokok', 10500],
    ['Daging Sapi', 'kg', 'Daging', 130000],
    ['Daging Ayam', 'kg', 'Daging', 35000],
    ['Telur Ayam', 'kg', 'Telur', 28000],
    ['Ikan Kembung', 'kg', 'Ikan', 30000],
    ['Ikan Tongkol', 'kg', 'Ikan', 28000],
    ['Kedelai', 'kg', 'Kacang', 11000],
    ['Jagung', 'kg', 'Padi-padian', 8500],
    ['Tomat', 'kg', 'Sayuran', 12000],
    ['Kentang', 'kg', 'Sayuran', 15000]
  ];
  const stmtKomo = db.prepare("INSERT INTO komoditas (nama, satuan, kategori, harga_base) VALUES (?, ?, ?, ?)");
  komoData.forEach(d => stmtKomo.run(d));
  stmtKomo.finalize();

  // 2. Pasar
  const pasarData = [
    ['Pasar Tradisional A', 'A', 'Jl. Pahlawan No.1', '05.00–14.00', '🏪', 38],
    ['Pasar Induk B', 'B', 'Jl. Raya Industri No.12', '04.00–16.00', '🏬', 51],
    ['Pasar Satelit C', 'C', 'Jl. Merdeka No.5', '06.00–13.00', '🛒', 22],
    ['Pasar Modern D', 'D', 'Jl. Diponegoro No.88', '07.00–20.00', '🏢', 31],
    ['Pasar Rakyat E', 'E', 'Jl. Sudirman No.44', '05.30–14.30', '🛍️', 27]
  ];
  const stmtPasar = db.prepare("INSERT INTO pasar (nama, kode, alamat, jam_operasional, icon, pedagang_count) VALUES (?, ?, ?, ?, ?, ?)");
  pasarData.forEach(d => stmtPasar.run(d));
  stmtPasar.finalize();

  // 3. Pedagang
  const pedagangData = [
    ['Ibu Sari Dewi', 1, 'A-001', '0812-3456-7890', 'Beras Medium, Beras Premium'],
    ['Pak Joni Prasetyo', 1, 'A-023', '0813-2345-6789', 'Cabai Merah, Cabai Rawit'],
    ['Bu Rohayati', 1, 'A-045', '0811-3456-7890', 'Minyak Goreng, Gula Pasir'],
    ['Pak Samsuri', 2, 'B-012', '0814-5678-9012', 'Daging Sapi, Daging Ayam'],
    ['Bu Aminah', 2, 'B-034', '0815-6789-0123', 'Tomat, Kentang, Sayuran'],
    ['Pak Hendra', 2, 'B-056', '0816-7890-1234', 'Ikan Kembung, Ikan Tongkol'],
    ['Bu Lastri', 3, 'C-001', '0817-8901-2345', 'Telur Ayam, Daging Ayam'],
    ['Pak Wahyu', 3, 'C-021', '0818-9012-3456', 'Tepung Terigu, Kedelai'],
    ['Bu Wati Susanti', 4, 'D-010', '0819-0123-4567', 'Beras, Minyak, Gula'],
    ['Pak Rudi Hartono', 5, 'E-003', '0820-1234-5678', 'Jagung, Kentang, Bawang']
  ];
  const stmtPedagang = db.prepare("INSERT INTO pedagang (nama, pasar_id, lapak, telp, komoditas_list) VALUES (?, ?, ?, ?, ?)");
  pedagangData.forEach(d => stmtPedagang.run(d));
  stmtPedagang.finalize();

  // 4. Users
  const userData = [
    ['Dr. Ahmad Supriadi', 'admin01', 'demo123', 'admin', 'aktif', 'Hari ini 08:45', null],
    ['Ir. Budi Santoso, MM', 'dinas01', 'demo123', 'dinas', 'aktif', 'Hari ini 09:12', null],
    ['Citra Lestari', 'enum01', 'demo123', 'enumerator', 'aktif', 'Hari ini 10:05', '1,2'],
    ['Dedi Kurniawan', 'enum02', 'demo123', 'enumerator', 'aktif', 'Kemarin 16:30', '1,3'],
    ['Eka Putri', 'enum03', 'demo123', 'enumerator', 'aktif', 'Hari ini 09:50', '2,4'],
    ['Fauzan Hakim', 'enum04', 'demo123', 'enumerator', 'nonaktif', '3 hari lalu', '3,5'],
    ['Gina Permata', 'enum05', 'demo123', 'enumerator', 'aktif', 'Hari ini 10:18', '4,5']
  ];
  const stmtUser = db.prepare("INSERT INTO users (nama, username, password, role, status, last_login, pasar_ids) VALUES (?, ?, ?, ?, ?, ?, ?)");
  userData.forEach(d => stmtUser.run(d));
  stmtUser.finalize();

  // 5. Logs
  const logData = [
    ['10:32', 'Input harga Beras Medium', 3, 1],
    ['10:28', 'Input harga Cabai Rawit', 5, 3],
    ['10:15', 'Input harga Daging Ayam', 7, 1],
    ['09:58', 'Publikasi data harga', 2, null],
    ['09:50', 'Tambah pedagang baru', 1, 4],
    ['09:12', 'Generate laporan bulanan', 2, null],
    ['08:45', 'Login sistem', 1, null]
  ];
  const stmtLog = db.prepare("INSERT INTO logs (waktu, aksi, user_id, pasar_id) VALUES (?, ?, ?, ?)");
  logData.forEach(d => stmtLog.run(d));
  stmtLog.finalize();

  // 6. Ketersediaan Bahan Pokok
  const ketersediaanData = [];
  // Generate ketersediaan data for main commodities in each market
  const mainKomoditas = [1, 2, 3, 4, 5, 6, 7, 8]; // Beras Medium, Premium, Cabai Merah, Rawit, Bawang Merah, Putih, Minyak, Gula
  const ketersediaanValues = [95, 88, 72, 65, 91, 85, 78, 82]; // Percentage availability
  
  for (let pasarId = 1; pasarId <= 5; pasarId++) {
    mainKomoditas.forEach((komoditasId, index) => {
      const ketersediaan = Math.max(30, Math.min(100, ketersediaanValues[index] + (Math.random() - 0.5) * 20));
      ketersediaanData.push([komoditasId, pasarId, Math.round(ketersediaan)]);
    });
  }
  
  const stmtKetersediaan = db.prepare("INSERT INTO ketersediaan (komoditas_id, pasar_id, ketersediaan, status, updated_at) VALUES (?, ?, ?, ?, date('now'))");
  ketersediaanData.forEach(d => stmtKetersediaan.run(d));
  stmtKetersediaan.finalize();

  // 6. Initial Harga (for history/rekap)
  const hargaData = [];
  // Generate some random prices for history for each commodity in each market
  for(let i=1; i<=18; i++) {
    for(let j=1; j<=5; j++) {
      const basePrice = komoData[i-1][3];
      // Create data for 7 days
      for(let day=0; day<7; day++) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        const dateStr = date.toISOString().split('T')[0];
        const randomPrice = Math.round(basePrice * (1 + (Math.random() - 0.5) * 0.1));
        // Pedagang IDs for market j are (j-1)*2+1 and (j-1)*2+2
        const pedId = (j-1)*2 + (Math.random() > 0.5 ? 1 : 2);
        hargaData.push([i, j, pedId, randomPrice, dateStr]);
      }
    }
  }
  const stmtHarga = db.prepare("INSERT INTO harga (komoditas_id, pasar_id, pedagang_id, harga, tanggal) VALUES (?, ?, ?, ?, ?)");
  hargaData.forEach(d => stmtHarga.run(d));
  stmtHarga.finalize();
});

module.exports = db;
