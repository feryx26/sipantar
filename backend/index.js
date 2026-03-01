const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Debug endpoint to show DB path and existence
app.get('/debug/db', (req, res) => {
  const p = path.join(__dirname, 'sipantar.db');
  res.json({ dbPath: p, exists: fs.existsSync(p) });
});

// Serve static files from frontend dist
app.use(express.static(path.join(__dirname, 'dist')));

// Auth API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT id, nama, username, role, status, last_login, pasar_ids FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    res.json(user);
  });
});

// Users API
app.get('/api/users', (req, res) => {
  db.all("SELECT id, nama, username, role, status, last_login, pasar_ids FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/users', (req, res) => {
  const { nama, username, password, role, status, pasar_ids } = req.body;
  console.log("Adding user:", req.body);
  db.run("INSERT INTO users (nama, username, password, role, status, pasar_ids) VALUES (?, ?, ?, ?, ?, ?)", 
    [nama, username, password, role, status || 'aktif', pasar_ids || null], function(err) {
    if (err) {
      console.error("DB Error adding user:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

app.put('/api/users/:id', (req, res) => {
  const { nama, username, role, status, pasar_ids } = req.body;
  console.log("Updating user:", req.params.id, req.body);
  db.run("UPDATE users SET nama = ?, username = ?, role = ?, status = ?, pasar_ids = ? WHERE id = ?", 
    [nama, username, role, status, pasar_ids, req.params.id], (err) => {
    if (err) {
      console.error("DB Error updating user:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

app.delete('/api/users/:id', (req, res) => {
  db.run("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Komoditas API
app.get('/api/komoditas', (req, res) => {
  db.all("SELECT * FROM komoditas", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/komoditas', (req, res) => {
  const { nama, satuan, kategori, harga_base } = req.body;
  console.log("Adding komoditas:", req.body);
  db.run("INSERT INTO komoditas (nama, satuan, kategori, harga_base) VALUES (?, ?, ?, ?)", 
    [nama, satuan, kategori, harga_base], function(err) {
    if (err) {
      console.error("DB Error adding komoditas:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

app.put('/api/komoditas/:id', (req, res) => {
  const { nama, satuan, kategori, harga_base } = req.body;
  console.log("Updating komoditas:", req.params.id, req.body);
  db.run("UPDATE komoditas SET nama = ?, satuan = ?, kategori = ?, harga_base = ? WHERE id = ?", 
    [nama, satuan, kategori, harga_base, req.params.id], (err) => {
    if (err) {
      console.error("DB Error updating komoditas:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

app.delete('/api/komoditas/:id', (req, res) => {
  db.run("DELETE FROM komoditas WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Pasar API
app.get('/api/pasar', (req, res) => {
  db.all("SELECT * FROM pasar", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/pasar', (req, res) => {
  const { nama, kode, alamat, jam_operasional, icon, pedagang_count } = req.body;
  console.log("Adding pasar:", req.body);
  db.run("INSERT INTO pasar (nama, kode, alamat, jam_operasional, icon, pedagang_count) VALUES (?, ?, ?, ?, ?, ?)", 
    [nama, kode, alamat, jam_operasional, icon || '🏪', pedagang_count || 0], function(err) {
    if (err) {
      console.error("DB Error adding pasar:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

app.put('/api/pasar/:id', (req, res) => {
  const { nama, kode, alamat, jam_operasional, icon, pedagang_count } = req.body;
  console.log("Updating pasar:", req.params.id, req.body);
  db.run("UPDATE pasar SET nama = ?, kode = ?, alamat = ?, jam_operasional = ?, icon = ?, pedagang_count = ? WHERE id = ?", 
    [nama, kode, alamat, jam_operasional, icon, pedagang_count, req.params.id], (err) => {
    if (err) {
      console.error("DB Error updating pasar:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

app.delete('/api/pasar/:id', (req, res) => {
  db.run("DELETE FROM pasar WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Pedagang API
app.get('/api/pedagang', (req, res) => {
  db.all("SELECT p.*, pas.nama as pasar_nama FROM pedagang p JOIN pasar pas ON p.pasar_id = pas.id", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/pedagang', (req, res) => {
  const { nama, pasar_id, lapak, telp, komoditas_list, status } = req.body;
  console.log("Adding pedagang:", req.body);
  db.run("INSERT INTO pedagang (nama, pasar_id, lapak, telp, komoditas_list, status) VALUES (?, ?, ?, ?, ?, ?)", 
    [nama, pasar_id, lapak, telp, komoditas_list, status || 'aktif'], function(err) {
    if (err) {
      console.error("DB Error adding pedagang:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

app.put('/api/pedagang/:id', (req, res) => {
  const { nama, pasar_id, lapak, telp, komoditas_list, status } = req.body;
  console.log("Updating pedagang:", req.params.id, req.body);
  db.run("UPDATE pedagang SET nama = ?, pasar_id = ?, lapak = ?, telp = ?, komoditas_list = ?, status = ? WHERE id = ?", 
    [nama, pasar_id, lapak, telp, komoditas_list, status, req.params.id], (err) => {
    if (err) {
      console.error("DB Error updating pedagang:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

app.delete('/api/pedagang/:id', (req, res) => {
  db.run("DELETE FROM pedagang WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Logs API
app.get('/api/logs', (req, res) => {
  const query = `
    SELECT l.*, u.username, p.nama as pasar_nama 
    FROM logs l 
    LEFT JOIN users u ON l.user_id = u.id 
    LEFT JOIN pasar p ON l.pasar_id = p.id
    ORDER BY l.id DESC LIMIT 20
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/logs', (req, res) => {
  const { aksi, user_id, pasar_id } = req.body;
  const waktu = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  db.run("INSERT INTO logs (waktu, aksi, user_id, pasar_id) VALUES (?, ?, ?, ?)", 
    [waktu, aksi, user_id, pasar_id || null], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Settings API
app.get('/api/settings', (req, res) => {
  db.all("SELECT * FROM settings", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const settings = {};
    rows.forEach(row => { settings[row.key] = row.value; });
    res.json(settings);
  });
});

app.post('/api/settings', (req, res) => {
  const settings = req.body;
  const keys = Object.keys(settings);
  
  db.serialize(() => {
    const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    keys.forEach(key => {
      stmt.run([key, settings[key]]);
    });
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// Harga API (Get latest prices per pasar)
app.get('/api/harga/latest', (req, res) => {
  const query = `
    SELECT k.nama as komoditas, k.satuan, p.nama as pasar, h.harga, h.tanggal
    FROM harga h
    JOIN komoditas k ON h.komoditas_id = k.id
    JOIN pasar p ON h.pasar_id = p.id
    WHERE h.tanggal = (SELECT MAX(tanggal) FROM harga)
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Harga History API
app.get('/api/harga/history', (req, res) => {
  const query = `
    SELECT h.tanggal, p.nama as pasar_nama, ped.nama as pedagang_nama, COUNT(h.komoditas_id) as jml_komoditas
    FROM harga h
    JOIN pasar p ON h.pasar_id = p.id
    JOIN pedagang ped ON h.pedagang_id = ped.id
    GROUP BY h.tanggal, h.pasar_id, h.pedagang_id
    ORDER BY h.tanggal DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Rekap API (Average price per commodity across markets)
app.get('/api/rekap', (req, res) => {
  const query = `
    SELECT k.id as komoditas_id, k.nama as komoditas_nama, k.satuan, p.id as pasar_id, p.nama as pasar_nama, AVG(h.harga) as avg_harga
    FROM komoditas k
    CROSS JOIN pasar p
    LEFT JOIN harga h ON h.komoditas_id = k.id AND h.pasar_id = p.id
    GROUP BY k.id, p.id
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Submit Harga API
app.post('/api/harga', (req, res) => {
  const { komoditas_id, pasar_id, pedagang_id, harga, user_id } = req.body;
  
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    
    const stmtPrice = db.prepare("INSERT INTO harga (komoditas_id, pasar_id, pedagang_id, harga) VALUES (?, ?, ?, ?)");
    stmtPrice.run([komoditas_id, pasar_id, pedagang_id, harga], function(err) {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).json({ error: err.message });
      }
      
      const waktu = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      db.get("SELECT nama FROM komoditas WHERE id = ?", [komoditas_id], (err, komo) => {
        const aksi = `Input harga ${komo ? komo.nama : 'Komoditas'}`;
        db.run("INSERT INTO logs (waktu, aksi, user_id, pasar_id) VALUES (?, ?, ?, ?)", [waktu, aksi, user_id, pasar_id], (err) => {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).json({ error: err.message });
          }
          db.run("COMMIT");
          res.json({ message: "Harga submitted and logged successfully" });
        });
      });
    });
    stmtPrice.finalize();
  });
});

// Harga History API (Public Trend)
app.get('/api/harga/trend', (req, res) => {
  const query = `
    SELECT k.nama as komoditas, h.tanggal, AVG(h.harga) as avg_harga
    FROM harga h
    JOIN komoditas k ON h.komoditas_id = k.id
    WHERE h.tanggal >= date('now', '-10 days')
    GROUP BY k.id, h.tanggal
    ORDER BY h.tanggal ASC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Kepala Dinas Settings API
app.get('/api/kadis', (req, res) => {
  db.all("SELECT key, value FROM settings WHERE key LIKE 'kadis_%'", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const result = {};
    rows.forEach(row => {
      result[row.key] = row.value;
    });
    res.json(result);
  });
});

app.put('/api/kadis', (req, res) => {
  const { kadis_nama, kadis_jabatan, kadis_sambutan, kadis_foto } = req.body;
  
  db.serialize(() => {
    db.run("UPDATE settings SET value = ? WHERE key = 'kadis_nama'", [kadis_nama || '']);
    db.run("UPDATE settings SET value = ? WHERE key = 'kadis_jabatan'", [kadis_jabatan || '']);
    db.run("UPDATE settings SET value = ? WHERE key = 'kadis_sambutan'", [kadis_sambutan || '']);
    db.run("UPDATE settings SET value = ? WHERE key = 'kadis_foto'", [kadis_foto || '']);
    
    res.json({ success: true, message: 'Data kepala dinas berhasil diperbarui' });
  });
});

// Ketersediaan Bahan Pokok API
app.get('/api/ketersediaan', (req, res) => {
  const query = `
      SELECT k2.id as id, k2.komoditas_id as komoditas_id, k2.pasar_id as pasar_id,
        k.nama as nama_komoditas, p.nama as nama_pasar,
        k2.ketersediaan, k2.status, k2.updated_at
    FROM ketersediaan k2
    JOIN komoditas k ON k2.komoditas_id = k.id
    JOIN pasar p ON k2.pasar_id = p.id
    ORDER BY p.nama, k.nama
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/ketersediaan', (req, res) => {
  const { komoditas_id, pasar_id, ketersediaan, status } = req.body;
  
  db.run("INSERT INTO ketersediaan (komoditas_id, pasar_id, ketersediaan, status, updated_at) VALUES (?, ?, ?, ?, date('now'))", 
    [komoditas_id, pasar_id, ketersediaan || 100, status || 'Tersedia'], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Data ketersediaan berhasil ditambahkan' });
  });
});

// Update ketersediaan entry
app.put('/api/ketersediaan/:id', (req, res) => {
  const id = req.params.id;
  const { komoditas_id, pasar_id, ketersediaan, status } = req.body;
  db.run("UPDATE ketersediaan SET komoditas_id = ?, pasar_id = ?, ketersediaan = ?, status = ?, updated_at = date('now') WHERE id = ?",
    [komoditas_id, pasar_id, ketersediaan || 100, status || 'Tersedia', id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Data ketersediaan berhasil diperbarui' });
  });
});

// Delete ketersediaan entry
app.delete('/api/ketersediaan/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM ketersediaan WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Data ketersediaan berhasil dihapus' });
  });
});

// Serve SPA fallback - must be after API routes
app.use((req, res) => {
  // If path starts with /api, it's a 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  // Otherwise serve index.html for SPA routing
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
