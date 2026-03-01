const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log('--- 🚀 Starting Full Build ---');
  
  // 1. Build Frontend
  console.log('1. Building Frontend...');
  execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });

  // 2. Prepare backend/dist
  console.log('2. Preparing backend/dist...');
  const distSrc = path.join(process.cwd(), 'frontend', 'dist');
  const distDest = path.join(process.cwd(), 'backend', 'dist');

  if (fs.existsSync(distDest)) {
    console.log('   Removing old backend/dist...');
    fs.rmSync(distDest, { recursive: true, force: true });
  }
  
  console.log('   Copying frontend/dist to backend/dist...');
  copyDir(distSrc, distDest);

  // 3. Install backend dependencies
  console.log('3. Installing Backend Dependencies...');
  execSync('cd backend && npm install', { stdio: 'inherit' });

  console.log('--- ✅ Build Completed Successfully! ---');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
