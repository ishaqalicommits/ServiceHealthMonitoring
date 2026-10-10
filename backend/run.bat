@echo off
echo ========================================================
echo Starting ServiceWatch Real-Time Monitoring System...
echo ========================================================

REM Set Maven and Java environment
set "PATH=C:\tools\apache-maven-3.9.9\bin;%PATH%"
set "JAVA_HOME=C:\Program Files\Java\jdk-17.0.18"

REM Check MongoDB service
echo Checking MongoDB connectivity...
sc query MongoDB | find "RUNNING" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Starting MongoDB local service...
    net start MongoDB
)

echo.
echo Running ServiceWatch with Spring Boot Maven plugin...
echo Access in browser: http://localhost:8080
echo Default Login: admin@servicewatch.local / Admin@12345
echo.

mvn spring-boot:run
pause
