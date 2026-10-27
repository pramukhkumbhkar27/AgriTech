# Agri-Tech Application Runner Script
$env:Path = "$env:LOCALAPPDATA\Programs\nodejs;" + [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$projDir = $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Green
Write-Host "  Starting Agri-Tech Smart Farming Management System" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

# Start Backend Server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projDir\server'; npm start" -WindowStyle Normal

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projDir\client'; npm run dev" -WindowStyle Normal

# Wait 3 seconds
Start-Sleep -Seconds 3

# Open default browser
Start-Process "http://localhost:5173"

Write-Host "Agri-Tech application is now active at http://localhost:5173" -ForegroundColor Cyan
