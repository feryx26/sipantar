#!/usr/bin/env pwsh
# Build script untuk SIPANTAR - Integrated Frontend + Backend Build

Write-Host "=== SIPANTAR Build Script ===" -ForegroundColor Cyan

# Step 1: Install frontend dependencies
Write-Host "`n[1/4] Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend install failed!" -ForegroundColor Red
    exit 1
}
Pop-Location

# Step 2: Build frontend
Write-Host "`n[2/4] Building frontend..." -ForegroundColor Yellow
Push-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    exit 1
}
Pop-Location

# Step 3: Copy frontend dist to backend
Write-Host "`n[3/4] Copying frontend assets to backend..." -ForegroundColor Yellow
if (Test-Path "backend/dist") {
    Remove-Item -Path "backend/dist" -Recurse -Force
}
Copy-Item -Path "frontend/dist" -Destination "backend/dist" -Recurse -Force
Write-Host "Assets copied successfully" -ForegroundColor Green

# Step 4: Install backend dependencies
Write-Host "`n[4/4] Installing backend dependencies..." -ForegroundColor Yellow
Push-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend install failed!" -ForegroundColor Red
    exit 1
}
Pop-Location

Write-Host "`n=== BUILD COMPLETE ===" -ForegroundColor Green
Write-Host "Application built successfully!`n" -ForegroundColor Green
Write-Host "To start the application, run:" -ForegroundColor Cyan
Write-Host "  cd backend && npm start" -ForegroundColor White
Write-Host "`nThen open browser to: http://localhost:5000" -ForegroundColor Cyan
