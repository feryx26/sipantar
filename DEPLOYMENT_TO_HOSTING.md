# 📦 DEPLOYMENT GUIDE - File Build untuk Hosting

Berikut adalah struktur folder dan file yang perlu di-upload ke hosting.

---

## 📁 STRUKTUR FOLDER DEPLOYMENT

```
backend/
├── index.js              ← Main server file (PENTING)
├── database.js           ← Database initialization (PENTING)
├── package.json          ← Dependencies list (PENTING)
├── package-lock.json     ← Lock file (PENTING)
│
├── dist/                 ← Frontend static files (PENTING)
│   ├── index.html
│   ├── assets/
│   │   ├── index-BDeId0QO.css
│   │   └── index-CxeXP9ms.js
│   └── ... (built assets)
│
├── sipantar.db           ← Database (OPTIONAL - akan auto-create jika tidak ada)
│
└── node_modules/         ← Dependencies (OPTIONAL - install di hosting)
    ├── express/
    ├── sqlite3/
    ├── cors/
    └── ... (all npm packages)
```

---

## ✅ CARA UPLOAD KE HOSTING

### OPSI 1: Upload Dengan node_modules (MUDAH)

**File yang di-upload:**
```
backend/
├── index.js
├── database.js
├── package.json
├── package-lock.json
├── dist/                 (seluruh folder)
├── node_modules/        (seluruh folder - optional tapi lebih cepat)
└── sipantar.db          (jika sudah ada)
```

**Tahap 1: Upload semua file dengan FTP/SSH**

```bash
# Di hosting, navigate ke folder backend dan jalankan:
npm start
```

**Kelebihan:** Cepat, tidak perlu install dependencies lagi  
**Kekurangan:** Ukuran folder besar (node_modules ~300MB)

---

### OPSI 2: Upload Tanpa node_modules (HEMAT)

**File yang di-upload:**
```
backend/
├── index.js             (REQUIRED)
├── database.js          (REQUIRED)
├── package.json         (REQUIRED)
├── package-lock.json    (REQUIRED)
├── dist/                (REQUIRED - berisi frontend)
└── sipantar.db          (optional)
```

**Tahap 1: Upload file-file di atas**

**Tahap 2: Install dependencies di hosting**
```bash
cd backend
npm install

# Tunggu sampai selesai (~2-5 menit)
```

**Tahap 3: Jalankan server**
```bash
npm start
```

**Kelebihan:** Ukuran upload kecil (~1-2 MB saja)  
**Kekurangan:** Perlu install dependencies di hosting

---

## 🔑 FILE KRITIS (JANGAN LUP!)

| File | Keterangan |
|------|-----------|
| `index.js` | **WAJIB** - Main server |
| `database.js` | **WAJIB** - Database setup |
| `package.json` | **WAJIB** - Dependencies list |
| `package-lock.json` | **WAJIB** - Lock file |
| `dist/` | **WAJIB** - Frontend assets |
| `sipantar.db` | Optional - akan auto-create |

---

## 📊 UKURAN FILE

```
index.js                    ~15 KB
database.js                 ~8 KB
dist/ (frontend assets)     ~493 KB
package.json               ~1 KB
sipantar.db (database)     ~500 KB (tergantung data)
node_modules/              ~300 MB (BESAR - optional)

Minimal deploy size:        ~510 KB
Full deploy size:           ~300+ MB
```

---

## 🚀 INSTRUKSI DEPLOYMENT STEP-BY-STEP

### Untuk Hosting Populer:

#### 1. **Heroku** (Recommended)
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create sipantar-app

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### 2. **Railway.app**
```bash
# Connect GitHub + Deploy
# Set environment variable: PORT=5000
# Auto-restart jika crash
```

#### 3. **Replit**
```bash
# Upload folder backend
# Click "Run" atau jalankan: npm start
```

#### 4. **VPS/Dedicated Server** (Linode, DigitalOcean, dll)
```bash
# SSH ke server
ssh root@your_server_ip

# Navigasi ke folder
cd /var/www/sipantar/backend  # atau folder pilihan Anda

# Clone/upload files
# Option A: git clone
# Option B: scp -r /local/path/* root@server:/remote/path/
# Option C: FTP upload via panel

# Install dependencies
npm install

# Jalankan dengan PM2 (recommended untuk production)
npm install -g pm2
pm2 start index.js --name "sipantar"
pm2 startup
pm2 save
```

---

## 🌍 ENVIRONMENT SETUP DI HOSTING

### Di Server/Hosting Control Panel, set:

```bash
NODE_ENV=production
PORT=5000  (atau port yang disediakan hosting)
```

### File `.env` (Optional - di folder backend)

```
PORT=5000
DB_PATH=./sipantar.db
NODE_ENV=production
```

---

## 📋 CHECKLIST DEPLOYMENT

Sebelum upload, pastikan:

- [ ] File `index.js` ada
- [ ] File `database.js` ada
- [ ] Folder `dist/` ada (dengan asset frontend)
- [ ] `package.json` ada
- [ ] `package-lock.json` ada
- [ ] Database file ada atau akan auto-create (OK)
- [ ] Port 5000 tersedia di hosting (atau ubah di code)
- [ ] Node.js versi 18+ terinstall di hosting

---

## 🧪 TEST SETELAH DEPLOY

1. **Cek apakah server berjalan:**
   ```bash
   curl http://localhost:5000
   ```

2. **Akses di browser:**
   ```
   http://your-hosting-url:5000
   ```

3. **Test login:**
   - Username: `admin`
   - Password: `admin123`

4. **Test API:**
   ```bash
   curl http://your-hosting-url:5000/api/komoditas
   curl http://your-hosting-url:5000/api/ketersediaan
   ```

---

## 🆘 TROUBLESHOOTING DEPLOYMENT

### 1. Port Already in Use
```bash
# Ubah port di index.js
const PORT = process.env.PORT || 3000;

# Atau kill process yang pakai port 5000
lsof -i :5000  # Find process
kill -9 <PID>  # Kill process
```

### 2. Database Error
```bash
# Delete database untuk reset
rm backend/sipantar.db

# Restart server - database akan auto-create dengan seed data
npm start
```

### 3. Frontend Not Loading
- Cek apakah folder `dist/` ada
- Cek apakah `index.html` ada di dalam `dist/`
- Cek browser console untuk error

### 4. npm install Gagal
```bash
# Clear cache
npm cache clean --force

# Install ulang
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 QUICK DEPLOYMENT COMMANDS

### Untuk Linux/Mac VPS:

```bash
# SSH
ssh user@your_server

# Navigate
cd /var/www

# Download file
wget -O sipantar.zip https://your-repo-url/archive/main.zip
unzip sipantar.zip
cd sipantar/backend

# Install & Run
npm install
npm start

# Atau dengan PM2
pm2 start index.js --name "sipantar"
```

### Untuk Windows VPS:

```powershell
# RDP Connect
# Navigate menggunakan Explorer
# Copy-paste folder backend ke C:\apps\

# PowerShell
cd C:\apps\backend
npm install
npm start
```

---

## 🔒 PRODUCTION TIPS

1. **Gunakan PM2 untuk auto-restart:**
   ```bash
   npm install -g pm2
   pm2 start index.js --name "sipantar"
   ```

2. **Backup database secara berkala:**
   ```bash
   cp backend/sipantar.db backend/sipantar.db.backup
   ```

3. **Monitor logs:**
   ```bash
   pm2 logs sipantar
   ```

4. **Update dependencies aman:**
   ```bash
   npm audit fix
   npm update --safe
   ```

---

## 📞 SHARING DEPLOYMENT LINK

Setelah deploy, hosting akan memberikan URL seperti:

- Heroku: `https://sipantar-app.herokuapp.com`
- Railway: `https://sipantar-production.up.railway.app`
- VPS: `https://your-domain.com` atau `http://your-server-ip:5000`

Share URL tersebut kepada tim/user untuk akses aplikasi.

---

## 🎯 SUMMARY DEPLOYMENT

```
1. Siapkan folder backend dengan file wajib
2. Upload ke hosting
3. Run: npm install (jika belum ada node_modules)
4. Run: npm start
5. Test di browser: http://your-url:5000
6. Share URL ke user
```

**Ukuran file untuk upload: ~1-2 MB** (tanpa node_modules)  
**Atau: ~300+ MB** (dengan node_modules)

---

Pertanyaan? Cek `README.md` atau `DEPLOYMENT.md` untuk info lebih detail!
