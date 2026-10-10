# PowerShell Runner for ServiceWatch
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting ServiceWatch Real-Time Monitoring System..." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

$env:PATH = "C:\tools\apache-maven-3.9.9\bin;" + $env:PATH
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17.0.18"

# Check and start MongoDB service if stopped
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -ne 'Running') {
    Write-Host "Starting MongoDB Service..." -ForegroundColor Yellow
    Start-Service -Name MongoDB
}

Write-Host "Starting Spring Boot application on http://localhost:8080" -ForegroundColor Green
Write-Host "Default Admin Credentials:" -ForegroundColor Yellow
Write-Host "  Email:    admin@servicewatch.local" -ForegroundColor White
Write-Host "  Password: Admin@12345" -ForegroundColor White
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan

mvn spring-boot:run
