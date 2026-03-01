const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '../.env' });
const supabase = require('./supabase_client');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from frontend dist
app.use(express.static(path.join(__dirname, 'dist')));

// Connection Test API
app.get('/api/test-db', async (req, res) => {
  const { data, error } = await supabase.from('settings').select('key').limit(1);
  if (error) {
    return res.status(500).json({ 
      connected: false, 
      error: error.message,
      message: "Supabase connection failed. Check your .env credentials."
    });
  }
  res.json({ 
    connected: true, 
    message: "Successfully connected to Supabase!",
    sample: data
  });
});

// Helper to handle Supabase errors
const handleRes = (res, { data, error }) => {
  if (error) {
    console.error("Supabase Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
};

// Auth API
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const { data, error } = await supabase
    .from('users')
    .select('id, nama, username, role, status, last_login, pasar_ids')
    .eq('username', username)
    .eq('password', password)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 is single() with no rows
    return res.status(500).json({ error: error.message });
  }
  if (!data) return res.status(401).json({ message: "Invalid credentials" });
  res.json(data);
});

// Users API
app.get('/api/users', async (req, res) => {
  const result = await supabase
    .from('users')
    .select('id, nama, username, role, status, last_login, pasar_ids');
  handleRes(res, result);
});

app.post('/api/users', async (req, res) => {
  const { nama, username, password, role, status, pasar_ids } = req.body;
  const result = await supabase
    .from('users')
    .insert([{ nama, username, password, role, status: status || 'aktif', pasar_ids: pasar_ids || null }])
    .select('id')
    .single();
  handleRes(res, result);
});

app.put('/api/users/:id', async (req, res) => {
  const { nama, username, role, status, pasar_ids } = req.body;
  const result = await supabase
    .from('users')
    .update({ nama, username, role, status, pasar_ids })
    .eq('id', req.params.id);
  handleRes(res, result);
});

app.delete('/api/users/:id', async (req, res) => {
  const result = await supabase
    .from('users')
    .delete()
    .eq('id', req.params.id);
  handleRes(res, result);
});

// Komoditas API
app.get('/api/komoditas', async (req, res) => {
  const result = await supabase.from('komoditas').select('*');
  handleRes(res, result);
});

app.post('/api/komoditas', async (req, res) => {
  const { nama, satuan, kategori, harga_base } = req.body;
  const result = await supabase
    .from('komoditas')
    .insert([{ nama, satuan, kategori, harga_base }])
    .select('id')
    .single();
  handleRes(res, result);
});

app.put('/api/komoditas/:id', async (req, res) => {
  const { nama, satuan, kategori, harga_base } = req.body;
  const result = await supabase
    .from('komoditas')
    .update({ nama, satuan, kategori, harga_base })
    .eq('id', req.params.id);
  handleRes(res, result);
});

app.delete('/api/komoditas/:id', async (req, res) => {
  const result = await supabase
    .from('komoditas')
    .delete()
    .eq('id', req.params.id);
  handleRes(res, result);
});

// Pasar API
app.get('/api/pasar', async (req, res) => {
  const result = await supabase.from('pasar').select('*');
  handleRes(res, result);
});

app.post('/api/pasar', async (req, res) => {
  const { nama, kode, alamat, jam_operasional, icon, pedagang_count } = req.body;
  const result = await supabase
    .from('pasar')
    .insert([{ nama, kode, alamat, jam_operasional, icon: icon || '🏪', pedagang_count: pedagang_count || 0 }])
    .select('id')
    .single();
  handleRes(res, result);
});

app.put('/api/pasar/:id', async (req, res) => {
  const { nama, kode, alamat, jam_operasional, icon, pedagang_count } = req.body;
  const result = await supabase
    .from('pasar')
    .update({ nama, kode, alamat, jam_operasional, icon, pedagang_count })
    .eq('id', req.params.id);
  handleRes(res, result);
});

app.delete('/api/pasar/:id', async (req, res) => {
  const result = await supabase
    .from('pasar')
    .delete()
    .eq('id', req.params.id);
  handleRes(res, result);
});

// Pedagang API
app.get('/api/pedagang', async (req, res) => {
  const result = await supabase
    .from('pedagang')
    .select('*, pasar:pasar_id(nama)');
  
  if (result.error) return handleRes(res, result);
  
  // Format for compatibility
  const formattedData = result.data.map(p => ({
    ...p,
    pasar_nama: p.pasar ? p.pasar.nama : 'Unknown'
  }));
  res.json(formattedData);
});

app.post('/api/pedagang', async (req, res) => {
  const { nama, pasar_id, lapak, telp, komoditas_list, status } = req.body;
  const result = await supabase
    .from('pedagang')
    .insert([{ nama, pasar_id, lapak, telp, komoditas_list, status: status || 'aktif' }])
    .select('id')
    .single();
  handleRes(res, result);
});

app.put('/api/pedagang/:id', async (req, res) => {
  const { nama, pasar_id, lapak, telp, komoditas_list, status } = req.body;
  const result = await supabase
    .from('pedagang')
    .update({ nama, pasar_id, lapak, telp, komoditas_list, status })
    .eq('id', req.params.id);
  handleRes(res, result);
});

app.delete('/api/pedagang/:id', async (req, res) => {
  const result = await supabase
    .from('pedagang')
    .delete()
    .eq('id', req.params.id);
  handleRes(res, result);
});

// Logs API
app.get('/api/logs', async (req, res) => {
  const result = await supabase
    .from('logs')
    .select('*, users:user_id(username), pasar:pasar_id(nama)')
    .order('id', { ascending: false })
    .limit(20);
    
  if (result.error) return handleRes(res, result);
  
  // Format for compatibility
  const formattedData = result.data.map(l => ({
    ...l,
    username: l.users ? l.users.username : 'System',
    pasar_nama: l.pasar ? l.pasar.nama : null
  }));
  res.json(formattedData);
});

app.post('/api/logs', async (req, res) => {
  const { aksi, user_id, pasar_id } = req.body;
  const waktu = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const result = await supabase
    .from('logs')
    .insert([{ waktu, aksi, user_id, pasar_id: pasar_id || null }])
    .select('id')
    .single();
  handleRes(res, result);
});

// Settings API
app.get('/api/settings', async (req, res) => {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) return res.status(500).json({ error: error.message });
  
  const settings = {};
  data.forEach(row => { settings[row.key] = row.value; });
  res.json(settings);
});

app.post('/api/settings', async (req, res) => {
  const settings = req.body;
  const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
  
  const { error } = await supabase.from('settings').upsert(rows);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Harga API (Get latest prices per pasar)
app.get('/api/harga/latest', async (req, res) => {
  // Get max date first
  const { data: maxDateData, error: dateError } = await supabase
    .from('harga')
    .select('tanggal')
    .order('tanggal', { ascending: false })
    .limit(1)
    .single();
    
  if (dateError) return res.status(500).json({ error: dateError.message });
  if (!maxDateData) return res.json([]);
  
  const result = await supabase
    .from('harga')
    .select('harga, tanggal, komoditas:komoditas_id(nama, satuan), pasar:pasar_id(nama)')
    .eq('tanggal', maxDateData.tanggal);
    
  if (result.error) return handleRes(res, result);
  
  // Format for compatibility
  const formattedData = result.data.map(h => ({
    komoditas: h.komoditas ? h.komoditas.nama : 'Unknown',
    satuan: h.komoditas ? h.komoditas.satuan : '',
    pasar: h.pasar ? h.pasar.nama : 'Unknown',
    harga: h.harga,
    tanggal: h.tanggal
  }));
  res.json(formattedData);
});

// Harga History API
app.get('/api/harga/history', async (req, res) => {
  const { data, error } = await supabase
    .from('harga')
    .select('tanggal, pasar:pasar_id(nama), pedagang:pedagang_id(nama), komoditas_id');
    
  if (error) return res.status(500).json({ error: error.message });
  
  // Supabase doesn't support GROUP BY directly in the same way. 
  // We'll group in memory for now, or use an RPC if needed.
  const groups = {};
  data.forEach(h => {
    const key = `${h.tanggal}_${h.pasar?.nama}_${h.pedagang?.nama}`;
    if (!groups[key]) {
      groups[key] = {
        tanggal: h.tanggal,
        pasar_nama: h.pasar?.nama || 'Unknown',
        pedagang_nama: h.pedagang?.nama || 'Unknown',
        jml_komoditas: 0
      };
    }
    groups[key].jml_komoditas++;
  });
  
  res.json(Object.values(groups).sort((a, b) => b.tanggal.localeCompare(a.tanggal)));
});

// Rekap API (Average price per commodity across markets)
app.get('/api/rekap', async (req, res) => {
  // We need to cross join komoditas and pasar, then left join harga.
  // This is best done with an RPC in Supabase, but let's try a simpler approach.
  const [komoditas, pasar, harga] = await Promise.all([
    supabase.from('komoditas').select('id, nama, satuan'),
    supabase.from('pasar').select('id, nama'),
    supabase.from('harga').select('komoditas_id, pasar_id, harga')
  ]);
  
  if (komoditas.error) return res.status(500).json({ error: komoditas.error.message });
  if (pasar.error) return res.status(500).json({ error: pasar.error.message });
  if (harga.error) return res.status(500).json({ error: harga.error.message });
  
  const rekap = [];
  komoditas.data.forEach(k => {
    pasar.data.forEach(p => {
      const prices = harga.data.filter(h => h.komoditas_id === k.id && h.pasar_id === p.id);
      const avg_harga = prices.length > 0 
        ? prices.reduce((sum, h) => sum + h.harga, 0) / prices.length 
        : null;
        
      rekap.push({
        komoditas_id: k.id,
        komoditas_nama: k.nama,
        satuan: k.satuan,
        pasar_id: p.id,
        pasar_nama: p.nama,
        avg_harga: avg_harga
      });
    });
  });
  
  res.json(rekap);
});

// Submit Harga API
app.post('/api/harga', async (req, res) => {
  const { komoditas_id, pasar_id, pedagang_id, harga, user_id } = req.body;
  
  const { error: hargaError } = await supabase
    .from('harga')
    .insert([{ komoditas_id, pasar_id, pedagang_id, harga }]);
    
  if (hargaError) return res.status(500).json({ error: hargaError.message });
  
  // Log the action
  const waktu = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  await supabase
    .from('logs')
    .insert([{ waktu, aksi: `Input harga harian`, user_id, pasar_id }]);
    
  res.json({ success: true });
});

// Ketersediaan API
app.get('/api/ketersediaan', async (req, res) => {
  const result = await supabase
    .from('ketersediaan')
    .select('*, komoditas:komoditas_id(nama, satuan), pasar:pasar_id(nama)');
    
  if (result.error) return handleRes(res, result);
  
  // Format for compatibility
  const formattedData = result.data.map(k => ({
    ...k,
    komoditas_nama: k.komoditas ? k.komoditas.nama : 'Unknown',
    satuan: k.komoditas ? k.komoditas.satuan : '',
    pasar_nama: k.pasar ? k.pasar.nama : 'Unknown'
  }));
  res.json(formattedData);
});

app.post('/api/ketersediaan', async (req, res) => {
  const { komoditas_id, pasar_id, ketersediaan, status } = req.body;
  const result = await supabase
    .from('ketersediaan')
    .upsert([{ komoditas_id, pasar_id, ketersediaan, status, updated_at: new Date().toISOString().split('T')[0] }], { onConflict: 'komoditas_id,pasar_id' });
  handleRes(res, result);
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Supabase-ready server running on port ${PORT}`);
  });
}

module.exports = app;
