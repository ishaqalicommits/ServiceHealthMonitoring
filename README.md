# ServiceWatch — Real-Time Service Health Monitoring System

A real-time website and API monitoring system that continuously checks service availability, response times, and HTTP status codes. It detects failures, applies configurable retry and timeout settings, alerts operators via Discord and webhooks, and provides incident management alongside customizable public status pages.

---

## 🏗️ Architecture & Technology Stack

The project uses a decoupled, modern architecture:

```
ServiceWatch
├── frontend/             # React 18 + Vite SPA (Port 5173)
│   ├── src/
│   │   ├── components/   # MetricCard, StatusBadge, Navbar, Sidebar, Layout
│   │   ├── context/      # AuthContext (Session state & role checks)
│   │   ├── pages/        # 16 Full-featured monitoring pages
│   │   └── services/     # Axios API service configured with proxy
│   └── vite.config.js    # Dev proxy routing /api -> http://localhost:8080
│
└── backend/              # Spring Boot 3 + Java 17 REST API (Port 8080)
    ├── src/main/java/com/servicewatch/
    │   ├── config/       # Spring Security, MongoConfig, SchedulerConfig
    │   ├── controller/api# REST API Controllers (11 controllers)
    │   ├── enums/        # MonitorType, MonitorStatus, IncidentStatus, UserRole
    │   ├── model/        # MongoDB Documents (User, Monitor, CheckResult, etc.)
    │   ├── monitoring/   # HTTP, TCP, Ping, SSL Checkers + MonitoringEngine
    │   ├── repository/   # Spring Data MongoDB Repositories
    │   ├── scheduler/    # MonitoringScheduler (configurable cron/fixedDelay)
    │   ├── security/     # BCrypt, DaoAuthenticationProvider, SecurityUtils
    │   ├── service/      # Analytics, Incident, Maintenance, Notification, etc.
    │   └── util/         # SSRF-safe UrlValidator, UptimeCalculator, DataInitializer
    └── pom.xml
```

### Stack Details
- **Frontend**: React 18, Vite 8, JavaScript, React Router v6, Bootstrap 5.3, Bootstrap Icons, Chart.js & React-ChartJS-2.
- **Backend**: Java 17, Spring Boot 3.2.5, Spring MVC REST API, Spring Security 6 (BCrypt), Spring Data MongoDB, Spring Scheduler (Bounded Thread Pool).
- **Database**: MongoDB (Local or Atlas) at `mongodb://localhost:27017/servicewatch`.
- **Engine**: Native Java 11+ `HttpClient`, `Socket` (TCP), `InetAddress` (Ping), TLS/X.509 Certificate Inspection.

---

## 🚀 Quick Start / Running in VS Code & Localhost

### Prerequisites
1. **Java 17 JDK** (Oracle JDK 17 or OpenJDK 17 installed).
2. **Node.js & npm** (Node.js 18+ or 20+).
3. **MongoDB** running on `localhost:27017` (MongoDB Community Server / Windows Service).
4. **Maven** (`mvn` command or included in `C:\tools\apache-maven-3.9.9\bin`).

---

### Option 1: One-Click Startup (Recommended)

From the project root:
- **Windows Command Prompt / Explorer**: Double-click or run `run.bat`
- **Windows PowerShell**: Run `.\run.ps1`

This will automatically launch the **Spring Boot Backend** in one terminal and the **React Vite Frontend** in another.

---

### Option 2: Running via VS Code

1. Open `c:\Ali\Service Health Monitoring` in VS Code (`File > Open Folder...`).
2. Press `Ctrl + Shift + P` and type `Tasks: Run Task`.
3. Select **`1. Run Backend (Spring Boot)`** (starts Spring Boot on `http://localhost:8080`).
4. Press `Ctrl + Shift + P`, select `Tasks: Run Task` again, and select **`2. Run Frontend (React Vite)`** (starts Vite on `http://localhost:5173`).
5. Open your browser and navigate to `http://localhost:5173`.

---

### Option 3: Manual Terminal Commands

#### Terminal 1 — Start Backend
```powershell
cd backend
mvn spring-boot:run
```
*(Or use `& "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run`)*

Backend will be available at: `http://localhost:8080`

#### Terminal 2 — Start Frontend
```powershell
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 🔐 Default Admin Credentials

When the application starts for the first time, `DataInitializer` automatically provisions the initial administrator account if no users exist:

- **Email**: `admin@servicewatch.local`
- **Password**: `Admin@12345`
- **Role**: `ADMIN`

*(You can update your password and display timezone after logging in via the Profile menu).*

---

## 🧭 Key Features & Navigation

| Route | Page | Description |
|---|---|---|
| `/` | **Overview / Dashboard** | High-level metrics (UP/DOWN counts, avg latency, uptime %, active outage alerts, Chart.js response time trend). |
| `/monitors` | **Monitors** | Manage all monitors with instant check, pause/resume, tag filtering, and search. |
| `/monitors/new` | **Add Monitor** | Configure HTTP, TCP, Ping, Keyword, and API monitors with custom thresholds. |
| `/monitors/:id` | **Monitor Detail** | Real-time response chart, latency history table, SSL certificate validity, and edit controls. |
| `/incidents` | **Incidents** | Outage tracker with status tabs (OPEN, ACKNOWLEDGED, RESOLVED). |
| `/incidents/:id` | **Incident Detail** | Root cause analysis, response timeline, operator updates, and incident resolution. |
| `/analytics` | **Analytics** | Uptime & latency metrics over 24h / 7d / 30d periods with Chart.js and one-click CSV export. |
| `/notifications` | **Notifications** | Email & Webhook alert channels, test alert triggers, and delivery audit logs. |
| `/maintenance` | **Maintenance** | Schedule maintenance windows with automatic alert suppression. |
| `/status-pages` | **Status Pages** | Create branded public status dashboards for stakeholders and customers. |
| `/status/:slug` | **Public Status Page** | Publicly accessible status dashboard (`http://localhost:5173/status/production-services`). |
| `/team` | **Team Members** | Manage user accounts, assign roles (`ADMIN`, `OPERATOR`, `VIEWER`), and toggle status. |
| `/settings` | **Settings** | Data retention policy (purge old check logs) and SSRF security rules review. |
| `/profile` | **Profile** | User profile preferences (timezone, light/dark theme) and password change. |

---

## 🧪 Automated Testing

To run the automated JUnit test suite for the backend:

```powershell
cd backend
mvn test
```

All 12 unit and service tests will run, covering:
- **Incident Service Lifecycle**: Failure detection, deduplication, resolution calculation.
- **Uptime Calculator**: Precision percentage and response-time math.
- **SSRF Url Validator**: Prevention of internal IP, cloud metadata (169.254.169.254), and loopback attacks.

To build the React production bundle:
```powershell
cd frontend
npm run build
```

---

## 🛡️ Security Highlights
- **BCrypt Password Hashing** (Cost factor 12)
- **Role-Based Access Control (RBAC)**: `ADMIN`, `OPERATOR`, `VIEWER`
- **SSRF Outbound Guard**: Blocks private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), AWS metadata (`169.254.169.254`), and loopback addresses.
- **Bounded Concurrency**: Thread pool task scheduler prevents resource exhaustion.
>>>>>>> fbc49c3 (Initial commit: ServiceWatch real-time service health monitoring system with Spring Boot, React, MongoDB, Discord alerts, public status pages, and landing page)
