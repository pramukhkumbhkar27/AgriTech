@echo off
echo ========================================================
echo   Starting Agri-Tech Smart Farming Management System
echo ========================================================

set PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%

start "AgriTech Backend Server (Port 5000)" cmd /k "cd server && npm start"
timeout /t 3 /nobreak >nul
start "AgriTech Frontend (Port 5173)" cmd /k "cd client && npm run dev"
timeout /t 3 /nobreak >nul

start http://localhost:5173

echo.
echo Both servers are starting up.
echo Application will open at http://localhost:5173
echo ========================================================
pause
