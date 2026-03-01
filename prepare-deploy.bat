@echo off
REM Script untuk prepare build folder untuk deployment

echo.
echo ========================================
echo    PREPARE BUILD FOR HOSTING DEPLOY
echo ========================================
echo.

REM Create deploy folder
if not exist "deploy" mkdir deploy

echo [1/3] Copying backend folder...
xcopy backend deploy\backend /E /I /Y /EXCLUDE:excludedeploy.txt > nul

echo [2/3] Removing node_modules to reduce size...
if exist "deploy\backend\node_modules" (
    echo       Removing node_modules...
    rmdir /S /Q "deploy\backend\node_modules" 2>nul
)

echo [3/3] Creating README_DEPLOY.txt...
(
    echo SIPANTAR - Build Ready for Deployment
    echo ====================================
    echo.
    echo This folder contains everything needed to run SIPANTAR on your hosting.
    echo.
    echo STEPS TO DEPLOY:
    echo 1. Upload entire backend folder to your hosting
    echo 2. SSH/Connect to hosting server
    echo 3. Navigate to backend folder: cd backend
    echo 4. Install dependencies: npm install
    echo 5. Start server: npm start
    echo.
    echo The server will run on http://localhost:5000
    echo (or your hosting URL on assigned port)
    echo.
    echo LOGIN CREDENTIALS:
    echo - Admin: admin / admin123
    echo - Dinas: dinas / dinas123
    echo - Enum: enum1 / enum1
    echo.
    echo For more info, see DEPLOYMENT_TO_HOSTING.md
) > deploy\backend\README_DEPLOY.txt

echo.
echo ========================================
echo    ✓ BUILD READY FOR DEPLOYMENT!
echo ========================================
echo.
echo Deploy folder location: %CD%\deploy\backend\
echo.
echo Next steps:
echo 1. Zip the deploy\backend folder
echo 2. Upload ZIP to your hosting
echo 3. Extract at hosting
echo 4. Run: npm install
echo 5. Run: npm start
echo.
pause
