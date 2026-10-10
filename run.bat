@echo off
title ServiceWatch - Startup Launcher
echo ===================================================
echo   ServiceWatch - Health Monitoring System
echo   Launching Backend (Spring Boot) and Frontend (React)
echo ===================================================

echo Starting Spring Boot Backend on http://localhost:8080 ...
start "ServiceWatch Backend" cmd /k "cd /d "%~dp0backend" && if exist "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" ("C:\tools\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run) else (mvn spring-boot:run)"

timeout /t 3 /nobreak > nul

echo Starting React Frontend on http://localhost:5173 ...
start "ServiceWatch Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================
echo   Services are starting up!
echo   - Backend API:  http://localhost:8080
echo   - React UI:     http://localhost:5173
echo   - Credentials:  admin@servicewatch.local / Admin@12345
echo ===================================================
pause
