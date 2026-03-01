# SIPANTAR - Sistem Informasi Pantau Harga Pasar

Aplikasi web untuk monitoring harga komoditas pangan di pasar-pasar dengan fitur ketersediaan bahan pokok.

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Struktur Aplikasi](#struktur-aplikasi)
- [Instalasi & Build](#instalasi--build)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [User Accounts](#user-accounts)
- [API Endpoints](#api-endpoints)
- [Fitur & Menu](#fitur--menu)

---

## ✨ Fitur Utama

- **Portal Publik**: Tampilkan harga komoditas, inflasi, dan ketersediaan bahan pokok kepada publik
- **Portal Internal**:
  - **Admin**: Manajemen penuh data (pasar, komoditas, pedagang, pengguna)
  - **Dinas**: Lihat analisis data, kontrol publikasi ke portal publik
  - **Enumerator**: Input harga harian dari pasar masing-masing
- **Ketersediaan Bahan Pokok**: Tracking real-time ketersediaan komoditas penting di setiap pasar
- **Dashboard & Analytics**: Visualisasi harga, inflasi, dan tren

---

## 📁 Struktur Aplikasi

```
sipangan3/
├── frontend/                 # React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.jsx
│   │   │   ├── InternalApp.jsx (Admin/Dinas/Enumerator Portal)
│   │   │   ├── PublicPortal.jsx
│   │   │   └── Login.jsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.app.json
│
├── backend/                  # Express + SQLite
│   ├── index.js             # Main server
│   ├── database.js          # DB initialization & seeding
│   ├── package.json
│   └── sipantar.db          # SQLite database (auto-created)
│
├── build.ps1                # Build script untuk build aplikasi
├── package.json             # Root package.json
└── README.md                # Dokumentasi ini

```

---

## 🚀 Instalasi & Build

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- Windows 10/11 (PowerShell 5.0+) atau Linux/Mac (bash)

### Quick Build (Recommended)

**Windows PowerShell:**
```powershell
.\build.ps1
```

**Linux/Mac:**
```bash
bash build.sh
# Jika belum ada, jalankan manual:
cd frontend && npm install && npm run build && cd ..
cp -r frontend/dist backend/dist
cd backend && npm install && cd ..
```

### Manual Build

1. **Build Frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

2. **Copy Assets to Backend:**
   ```bash
   # Windows
   Copy-Item -Path "frontend/dist" -Destination "backend/dist" -Recurse -Force
   
   # Linux/Mac
   cp -r frontend/dist backend/dist
   ```

3. **Install Backend:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

---

## ▶️ Menjalankan Aplikasi

### Start Backend Server

```bash
cd backend
npm start
```

Server akan berjalan di `http://localhost:5000`

```
Server running on port 5000
```

### Akses Aplikasi

- **Portal Publik**: http://localhost:5000
- **Portal Internal**: http://localhost:5000 → Login

Aplikasi akan otomatis initialize database dengan data seed pada startup pertama.

---

## 🖥️ Deploy ke VPS

Jika Anda memiliki VPS (misalnya DigitalOcean, Linode, VPS murah, atau server sendiri) maka backend dan frontend dapat dijalankan secara langsung di mesin tersebut. Anda akan mengakses aplikasi dengan IP server (mis. `http://123.45.67.89:5000`) atau nama domain yang diarahkan ke IP.

1. **Siapkan lingkungan**
   ```bash
   # login ke VPS via SSH
   ssh user@123.45.67.89

   # pastikan Nodejs/npm terpasang
   node -v   # harus >= 18
   npm -v
   # jika belum, install dari https://nodejs.org/en/download/package-manager/
   ```

2. **Clone atau copy project**
   ```bash
   git clone <repo-url> sipangan3
   cd sipangan3
   ```
   Jika Anda tidak menggunakan Git, unggah folder `deploy/backend` yang telah dibuat di lokal.

3. **Bangun aplikasi (opsional)**
   ```bash
   # satu kali di server; paket 'deploy' biasanya sudah berisi hasil build
   cd frontend && npm install && npm run build && cd ..
   cp -r frontend/dist backend/dist
   cd backend && npm install
   ```

4. **Jalankan server Node**
   Anda bisa menjalankan langsung `node index.js` atau memakai process manager agar tetap hidup.

   _Dengan pm2 (direkomendasikan):_
   ```bash
   cd backend
   npm install -g pm2        # install global jika belum
   pm2 start index.js --name sipantar --time
   pm2 save                 # simpan daftar process
   pm2 startup              # generate systemd script agar aktif saat reboot
   ```
   pm2 akan menampilkan port (5000) yang digunakan; jangan lupa membuka port ini pada firewall (ufw/iptables) atau lewat panel VPS.

   _Atau menggunakan systemd manual:_ buat file `/etc/systemd/system/sipantar.service` dengan konten:
   ```ini
   [Unit]
   Description=SIPANTAR Node app
   After=network.target

   [Service]
   Type=simple
   User=youruser
   WorkingDirectory=/home/youruser/sipangan3/backend
   ExecStart=/usr/bin/node index.js
   Restart=on-failure
   Environment=PORT=5000

   [Install]
   WantedBy=multi-user.target
   ```
   lalu `sudo systemctl enable sipantar && sudo systemctl start sipantar`.

5. **Konfigurasi firewall**
   ```bash
   # contoh menggunakan ufw
   sudo ufw allow 5000
   sudo ufw enable
   ```

6. **Akses melalui IP/domain**
   - buka browser ke `http://123.45.67.89:5000` (sesuaikan IP).
   - jika Anda ingin hanya mengetik IP tanpa port atau ingin memakai `http(s)://domain` biasa, gunakan **reverse proxy** seperti nginx atau Apache:
     ```nginx
     server {
         listen 80;
         server_name pakartiga.web.id 123.45.67.89;

         location / {
             proxy_pass http://127.0.0.1:5000;
             proxy_http_version 1.1;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection 'upgrade';
             proxy_set_header Host $host;
             proxy_cache_bypass $http_upgrade;
         }
     }
     ```
     setelah konfigurasi reload `sudo systemctl reload nginx`.
   - cara ini membuat aplikasi tersedia di port 80/443 standar sehingga pengguna tidak perlu menuliskan port.


> 🔁 **Perubahan kode**
> Setelah memodifikasi kode lokal, jalankan build lagi, copy ke VPS, lalu `pm2 restart sipantar`.

Dengan langkah ini backend Node + SQLite akan berjalan di server Anda sendiri; Node.js dibutuhkan karena kode ditulis dalam JavaScript/Express. Jika Anda ingin menukar SQLite dengan MySQL, ubah konfigurasi koneksi di `backend/database.js` dan pastikan MySQL tersedia di VPS.

---

## 👥 User Accounts

Gunakan credentials berikut untuk login:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Administrator
- **Akses**: Semua fitur manajemen data

### Dinas Account
- **Username**: `dinas`
- **Password**: `dinas123`
- **Role**: Dinas
- **Akses**: Analisis data, publikasi, ketersediaan bahan pokok

### Enumerator Account
- **Username**: `enum1`
- **Password**: `enum1`
- **Role**: Enumerator
- **Pasar**: Pasar A, Pasar B
- **Akses**: Input harga harian

---

## 🔌 API Endpoints

### Authentication
- `POST /api/login` - Login user

### Komoditas
- `GET /api/komoditas` - Daftar semua komoditas
- `POST /api/komoditas` - Tambah komoditas (admin)
- `PUT /api/komoditas/:id` - Edit komoditas (admin)
- `DELETE /api/komoditas/:id` - Hapus komoditas (admin)

### Pasar
- `GET /api/pasar` - Daftar semua pasar
- `POST /api/pasar` - Tambah pasar (admin)
- `PUT /api/pasar/:id` - Edit pasar (admin)
- `DELETE /api/pasar/:id` - Hapus pasar (admin)

### Pedagang
- `GET /api/pedagang` - Daftar pedagang
- `POST /api/pedagang` - Tambah pedagang (admin)
- `PUT /api/pedagang/:id` - Edit pedagang (admin)
- `DELETE /api/pedagang/:id` - Hapus pedagang (admin)

### Harga
- `GET /api/harga` - Daftar harga terkini
- `POST /api/harga` - Input/update harga (enumerator/dinas)
- `GET /api/harga/history` - Riwayat harga (admin/dinas)

### Ketersediaan Bahan Pokok ⭐
- `GET /api/ketersediaan` - Daftar ketersediaan
- `POST /api/ketersediaan` - Tambah/update ketersediaan (admin/dinas)
- `PUT /api/ketersediaan/:id` - Edit ketersediaan (admin/dinas)
- `DELETE /api/ketersediaan/:id` - Hapus ketersediaan (admin/dinas)

### Users
- `GET /api/users` - Daftar pengguna (admin)
- `POST /api/users` - Tambah pengguna (admin)
- `PUT /api/users/:id` - Edit pengguna (admin)
- `DELETE /api/users/:id` - Hapus pengguna (admin)

### Logs & Reports
- `GET /api/logs` - Audit logs
- `GET /api/rekap` - Rekapitulasi data
- `PUT /api/kadis` - Update info Kepala Dinas

---

## 🎯 Fitur & Menu

### Portal Publik (Public)
Tersedia untuk siapa saja tanpa login:

1. **Dashboard Harga**
   - Harga komoditas terkini per pasar
   - Status ("↑ Naik", "↓ Turun", "→ Stabil")
   - Perubahan harga harian

2. **Grafik & Analisis**
   - Tren harga 5 komoditas utama
   - Perubahan inflasi bulanan
   - Statistik rekapitulasi

3. **Ketersediaan Bahan Pokok**
   - Status ketersediaan per komoditas di setiap pasar
   - Warna indikator: 🟢 Tersedia (≥80%), 🟡 Terbatas (50-79%), 🔴 Langka (<50%)
   - Grafik visualisasi ketersediaan

4. **Detail Pasar**
   - Lokasi, jam operasional, jumlah pedagang
   - Daftar komoditas yang diperdagangkan

---

### Portal Internal (Admin/Dinas/Enumerator)

#### Admin Menu
- **Dashboard**: Overview data (pasar aktif, komoditas, inflasi, peringatan)
- **Rekapitulasi**: Ringkasan harga per tanggal
- **Inflasi & Tren**: Analisis perubahan harga
- **Data Stok**: Kondisi stok komoditas
- **Ketersediaan**: Manajemen ketersediaan bahan pokok ✨
  - Lihat semua ketersediaan
  - Tambah/edit/hapus entry ketersediaan
  - Update status dan persentase
- **Kelola Pengguna**: CRUD user (assign role & pasar)
- **Data Pasar**: CRUD pasar
- **Data Komoditas**: CRUD komoditas
- **Data Pedagang**: CRUD pedagang
- **Audit Log**: Riwayat aktivitas sistem

#### Dinas Menu
- **Dashboard**: Overview data
- **Rekapitulasi**: Analisis data
- **Inflasi & Tren**: Tren harga
- **Data Stok**: Kondisi stok
- **Ketersediaan**: Lihat & update ketersediaan bahan pokok ✨
- **Publikasi Data**: Publikasikan data ke portal publik
- **Export Laporan**: Download laporan harian/bulanan

#### Enumerator Menu
- **Dashboard**: Ringkasan kerja harian
- **Input Harga**: Form input harga per pedagang di pasar tugas
- **Riwayat Input**: Daftar input yang sudah disubmit
- **Data Pedagang**: Lihat pedagang tugas
- **Manajemen Pedagang**: Update kontak/status pedagang

---

## 💾 Database

Aplikasi menggunakan **SQLite** (file-based) yang otomatis dibuat:

```
backend/sipantar.db
```

### Schema Utama

- **komoditas**: Daftar komoditas yang dimonitor
- **pasar**: Daftar pasar
- **pedagang**: Pedagang di setiap pasar
- **harga**: Riwayat input harga harian
- **ketersediaan**: Data ketersediaan bahan pokok ⭐
- **users**: Account pengguna (admin, dinas, enumerator)
- **logs**: Audit log aktivitas
- **settings**: Konfigurasi (info kepala dinas, dll)

---

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm run dev
# Buka http://localhost:5173 untuk Vite dev server
```

### Backend Development
```bash
cd backend
npm run dev
# Jalankan dengan nodemon auto-reload
```

### Build untuk Production
```bash
cd frontend
npm run build

cd ../backend
npm start
# Serve fe dari backend static folder
```

---

## 📝 Catatan Penting

- Database SQLite auto-seed dengan data dummy saat startup
- Semua data di-store lokal (tidak cloud)
- CORS enabled untuk development
- Frontend built dengan Vite untuk optimasi production
- Backend melayani static assets dari `/backend/dist`

---

## 📞 Support

Jika ada issues:
1. Pastikan port 5000 tidak digunakan aplikasi lain
2. Hapus `backend/sipantar.db` untuk reset database
3. Re-run build script untuk fresh installation
4. Check console logs di backend terminal

---

**Build Date**: March 1, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

