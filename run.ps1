# ServiceWatch Launcher for PowerShell
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  ServiceWatch - Real-Time Health Monitoring System" -ForegroundColor Green
Write-Host "  Launching Spring Boot Backend + React Frontend" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
$mvnCmd = if (Test-Path "C:\tools\apache-maven-3.9.9\bin\mvn.cmd") { "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" } else { "mvn" }

# Start Backend
Write-Host "[1/2] Starting Spring Boot Backend (Port 8080)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; & '$mvnCmd' spring-boot:run"

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[2/2] Starting React Vite Frontend (Port 5173)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev"

Write-Host "`nServices started!" -ForegroundColor Green
Write-Host "  * React UI:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "  * Backend API: http://localhost:8080" -ForegroundColor Cyan
Write-Host "  * Default Admin: admin@servicewatch.local / Admin@12345" -ForegroundColor Yellow
