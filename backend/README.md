# ⚙️ ServiceWatch — Backend Architecture & Core Services

The backend of **ServiceWatch** is built with **Spring Boot 3.2.5** and **Java 17**, structured into clean, decoupled layers.

---

## 📂 Backend Architecture

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/servicewatch/
│   │   │   ├── ServiceWatchApplication.java       # Spring Boot main runner (@EnableScheduling)
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java            # Spring Security 6, BCrypt, session, CSRF, SSRF
│   │   │   │   ├── MongoConfig.java               # MongoDB connection & auditing configuration
│   │   │   │   └── SchedulerConfig.java           # Bounded ThreadPoolTaskScheduler (10 threads)
│   │   │   ├── controller/                        # Spring MVC Controller Layer
│   │   │   │   ├── AuthController.java            # /login, /403
│   │   │   │   ├── DashboardController.java       # /dashboard metrics & charts
│   │   │   │   ├── MonitorController.java         # /monitors CRUD, check-now, pause, resume
│   │   │   │   ├── IncidentController.java        # /incidents lifecycle & investigation updates
│   │   │   │   ├── AnalyticsController.java       # /analytics metrics & CSV export
│   │   │   │   ├── NotificationController.java    # /notifications channels & audit history
│   │   │   │   ├── MaintenanceController.java     # /maintenance scheduling
│   │   │   │   ├── StatusPageController.java      # /status/{slug} public status & admin list
│   │   │   │   ├── TeamController.java            # /team user management & roles
│   │   │   │   ├── SettingsController.java        # /settings data retention policy
│   │   │   │   ├── ProfileController.java         # /profile credentials & preferences
│   │   │   │   └── CustomErrorController.java     # /error safe error handler
│   │   │   ├── model/                             # MongoDB Document Models
│   │   │   │   ├── User.java                      # MongoDB 'users' collection
│   │   │   │   ├── Monitor.java                   # MongoDB 'monitors' collection
│   │   │   │   ├── CheckResult.java               # MongoDB 'checkResults' (Compound Index)
│   │   │   │   ├── Incident.java                  # MongoDB 'incidents' collection
│   │   │   │   ├── IncidentUpdate.java            # MongoDB 'incidentUpdates' collection
│   │   │   │   ├── NotificationChannel.java       # MongoDB 'notificationChannels'
│   │   │   │   ├── NotificationLog.java           # MongoDB 'notificationLogs'
│   │   │   │   ├── MaintenanceWindow.java         # MongoDB 'maintenanceWindows'
│   │   │   │   └── StatusPage.java                # MongoDB 'statusPages'
│   │   │   ├── enums/                             # MonitorType, MonitorStatus, UserRole, etc.
│   │   │   ├── repository/                        # Spring Data MongoDB Repositories
│   │   │   ├── service/                           # Business Logic Layer
│   │   │   ├── monitoring/                        # Monitoring Engine & Checkers
│   │   │   │   ├── MonitorChecker.java            # Strategy interface
│   │   │   │   ├── HttpMonitorChecker.java        # HTTP/HTTPS/API/Keyword checks via HttpClient
│   │   │   │   ├── TcpMonitorChecker.java         # Socket TCP connectivity checks
│   │   │   │   ├── PingMonitorChecker.java        # ICMP/TCP ping probing via InetAddress
│   │   │   │   ├── SslCertificateChecker.java     # TLS certificate inspection & expiry check
│   │   │   │   └── MonitoringEngine.java          # Orchestrator & deduplication engine
│   │   │   ├── notification/                      # Email and Webhook notification dispatchers
│   │   │   ├── scheduler/                         # MonitorScheduler (due check runner)
│   │   │   ├── security/                          # CustomUserDetailsService, SecurityUtils
│   │   │   └── util/                              # UrlValidator (SSRF), UptimeCalculator, DataInitializer
│   │   └── resources/
│   │       └── application.properties             # MongoDB URI, port 8080, mail, defaults
│   └── test/java/com/servicewatch/                # Automated JUnit 5 & Mockito test suite
├── pom.xml                                        # Maven dependencies & build configuration
├── run.bat                                        # Windows Batch runner
├── run.ps1                                        # PowerShell runner
└── README.md
```

---

## 🚀 Running the Backend

From the `backend/` folder:

```powershell
.\run.ps1
```
Or with Maven:
```powershell
mvn spring-boot:run
```
Or execute the JAR:
```powershell
java -jar target\servicewatch-1.0.0.jar
```
