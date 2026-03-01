#!/bin/bash
# Build script untuk SIPANTAR - Integrated Frontend + Backend Build

echo "=== SIPANTAR Build Script ==="
echo ""

# Step 1: Install frontend dependencies
echo "[1/4] Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "Frontend install failed!"
    exit 1
fi
cd ..

# Step 2: Build frontend
echo ""
echo "[2/4] Building frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "Frontend build failed!"
    exit 1
fi
cd ..

# Step 3: Copy frontend dist to backend
echo ""
echo "[3/4] Copying frontend assets to backend..."
rm -rf backend/dist
cp -r frontend/dist backend/dist
echo "Assets copied successfully"

# Step 4: Install backend dependencies
echo ""
echo "[4/4] Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Backend install failed!"
    exit 1
fi
cd ..

echo ""
echo "=== BUILD COMPLETE ==="
echo "Application built successfully!"
echo ""
echo "To start the application, run:"
echo "  cd backend && npm start"
echo ""
echo "Then open browser to: http://localhost:5000"
