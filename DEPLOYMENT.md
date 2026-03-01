# SIPANTAR - Deployment Guide

## 🎯 Build Status: ✅ COMPLETE

Aplikasi SIPANTAR telah dibangun secara lengkap dan siap untuk production.

---

## 📦 Build Output

```
✓ Frontend built with Vite
  - Size: 473.42 kB (gzip: 149.90 kB)
  - CSS: 19.38 kB (gzip: 4.41 kB)
  - Output: frontend/dist/

✓ Assets copied to backend
  - Location: backend/dist/

✓ Backend dependencies installed
  - Dependencies: Express, SQLite3, CORS, Body-Parser

✓ Application ready at http://localhost:5000
```

---

## ▶️ Quick Start

### 1. Start Server
```bash
cd backend
npm start
```

Output:
```
Server running on port 5000
```

### 2. Open Browser
```
http://localhost:5000
```

---

## 🔐 Login Credentials

### Admin Account
```
Username: admin
Password: admin123
```
✓ Full access to all management features

### Dinas Account
```
Username: dinas
Password: dinas123
```
✓ Data analysis and publication control

### Enumerator Account
```
Username: enum1
Password: enum1
```
✓ Daily price input (Markets: A, B)

---

## 📊 Key Features Deployed

### ✨ Ketersediaan Bahan Pokok (NEW)
- Real-time tracking of commodity availability
- Color-coded status: 🟢 Available | 🟡 Limited | 🔴 Scarce
- Full CRUD operations for Admin/Dinas
- Display on Public Portal & Internal Dashboard

### 📈 Public Portal (No Login)
- Real-time price data
- Availability visualization
- Market details and trends
- Inflation analysis

### 🔒 Internal Portal (Login Required)
- **Admin**: Complete data management
- **Dinas**: Analytics and publication control
- **Enumerator**: Daily price input

---

## 📁 Project Structure

```
sipangan3/
├── frontend/               # React + TypeScript
│   └── dist/              # Built assets
├── backend/               # Express + SQLite
│   ├── dist/             # Frontend static files (served)
│   ├── sipantar.db       # SQLite database
│   └── index.js          # Express server
├── build.ps1             # Windows build script
├── build.sh              # Linux/Mac build script
├── README.md             # Full documentation
└── DEPLOYMENT.md         # This file
```

---

## 🔄 Rebuild Application

If you need to rebuild after code changes:

### Windows
```powershell
.\build.ps1
```

### Linux/Mac
```bash
bash build.sh
```

---

## 🚀 Production Deployment

### Environment Variables
Create `.env` in backend folder (optional):
```bash
PORT=5000
DB_PATH=./sipantar.db
NODE_ENV=production
```

### Database Backup
```bash
# Backup database
cp backend/sipantar.db backend/sipantar.db.backup

# Restore from backup
cp backend/sipantar.db.backup backend/sipantar.db
```

### Reset Database
```bash
# Delete database to reset (a fresh one will be created on next start)
rm backend/sipantar.db  # Linux/Mac
del backend\sipantar.db  # Windows
```

---

## 🧪 Testing

### API Test (Example)
```bash
# Get all commodities
curl http://localhost:5000/api/komoditas

# Get availability data
curl http://localhost:5000/api/ketersediaan

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Frontend Test
1. Open http://localhost:5000
2. Navigate to different pages
3. Try login with different user roles
4. Test "Ketersediaan Bahan Pokok" feature

---

## 📋 Component Checklist

- [x] Frontend built with Vite
- [x] Backend Express server configured
- [x] SQLite database initialized with seed data
- [x] Authentication system (3 user roles)
- [x] Public Portal
- [x] Admin/Dinas/Enumerator portals
- [x] Ketersediaan Bahan Pokok CRUD
- [x] API endpoints fully functional
- [x] Static files served from backend
- [x] SPA routing configured
- [x] Build scripts created
- [x] Documentation complete

---

## 🛠️ Troubleshooting

### Port 5000 Already in Use
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Or change port in backend/index.js
# const PORT = process.env.PORT || 3000;
```

### Build Fails
1. Delete node_modules folders
2. Delete package-lock.json files
3. Run build script again

### Database Issues
1. Delete `backend/sipantar.db`
2. Restart server (fresh DB will be created)
3. Seed data will be automatically loaded

### Frontend Not Loading
1. Check if backend is running
2. Open browser console (F12) for errors
3. Verify `backend/dist` folder exists

---

## 📊 Performance Notes

- Frontend bundle: ~473 KB (uncompressed), ~150 KB (gzipped)
- Build time: ~5-10 seconds
- Startup time: <1 second
- Database: SQLite (suitable for small-medium deployments)

---

## 📝 Next Steps (Optional Enhancements)

1. Add environment-based configurations
2. Implement data encryption for sensitive fields
3. Add backup/restore automation
4. Deploy to cloud (Heroku, AWS, etc.)
5. Set up SSL/HTTPS
6. Implement rate limiting on APIs
7. Add data export to Excel/PDF

---

## ✅ Deployment Checklist

- [ ] Server is running (`npm start`)
- [ ] Frontend loads at http://localhost:5000
- [ ] Can login with test credentials
- [ ] Public portal is accessible
- [ ] Admin portal shows all features
- [ ] Ketersediaan menu is available and working
- [ ] Database is persisted (check sipantar.db exists)
- [ ] API endpoints respond with correct data

---

**Build Date**: March 1, 2026  
**Build Version**: 1.0.0  
**Status**: ✅ Production Ready  

For full documentation, see [README.md](README.md)
