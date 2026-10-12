package com.servicewatch.util;

import com.servicewatch.enums.*;
import com.servicewatch.model.*;
import com.servicewatch.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Seeds initial demo data on first startup.
 *
 * Runs ONCE when no users exist. Creates:
 *   - 1 admin user
 *   - 6 realistic monitors (HTTP, TCP, KEYWORD)
 *   - Historical check results for the last 24 hours
 *   - 2 sample incidents (1 resolved, 1 open)
 *   - 1 public status page
 *   - 1 notification channel
 *
 * Credentials: FIRST_ADMIN_EMAIL / FIRST_ADMIN_PASSWORD env vars
 */
@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository            userRepository;
    private final MonitorRepository         monitorRepository;
    private final CheckResultRepository     checkResultRepository;
    private final IncidentRepository        incidentRepository;
    private final IncidentUpdateRepository  incidentUpdateRepository;
    private final StatusPageRepository      statusPageRepository;
    private final NotificationChannelRepository notificationChannelRepository;
    private final PasswordEncoder           passwordEncoder;

    @Value("${app.first-admin.email:admin@servicewatch.local}")
    private String adminEmail;

    @Value("${app.first-admin.password:Admin@12345}")
    private String adminPassword;

    @Value("${app.first-admin.username:admin}")
    private String adminUsername;

    public DataInitializer(
            UserRepository userRepository,
            MonitorRepository monitorRepository,
            CheckResultRepository checkResultRepository,
            IncidentRepository incidentRepository,
            IncidentUpdateRepository incidentUpdateRepository,
            StatusPageRepository statusPageRepository,
            NotificationChannelRepository notificationChannelRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository                  = userRepository;
        this.monitorRepository               = monitorRepository;
        this.checkResultRepository           = checkResultRepository;
        this.incidentRepository              = incidentRepository;
        this.incidentUpdateRepository        = incidentUpdateRepository;
        this.statusPageRepository            = statusPageRepository;
        this.notificationChannelRepository   = notificationChannelRepository;
        this.passwordEncoder                 = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            return; // Already initialised — skip
        }

        log.info("=== ServiceWatch: seeding demo data ===");

        // ── 1. Admin user ────────────────────────────────────────────────────
        User admin = User.builder()
            .username(adminUsername)
            .email(adminEmail)
            .passwordHash(passwordEncoder.encode(adminPassword))
            .role(UserRole.ADMIN)
            .active(true)
            .totpEnabled(false)
            .timezone("Asia/Kolkata")
            .themePreference("dark")
            .createdAt(Instant.now().minus(30, ChronoUnit.DAYS))
            .updatedAt(Instant.now())
            .build();
        admin = userRepository.save(admin);
        String adminId = admin.getId();
        log.info("Created admin: {}", adminEmail);

        // ── 2. Monitors ──────────────────────────────────────────────────────
        Instant now = Instant.now();

        Monitor m1 = monitorRepository.save(Monitor.builder()
            .name("Main Website")
            .type(MonitorType.HTTP)
            .url("https://example.com")
            .checkIntervalSeconds(60)
            .timeoutSeconds(10)
            .retryCount(2)
            .failureThreshold(2)
            .expectedStatusCodes(List.of(200))
            .followRedirects(true)
            .tags(List.of("production", "web"))
            .status(MonitorStatus.UP)
            .enabled(true)
            .paused(false)
            .sslExpiryDays(87)
            .consecutiveFailures(0)
            .ownerId(adminId)
            .lastCheckedAt(now.minus(30, ChronoUnit.SECONDS))
            .lastStatusChange(now.minus(5, ChronoUnit.DAYS))
            .createdAt(now.minus(30, ChronoUnit.DAYS))
            .updatedAt(now)
            .build());

        Monitor m2 = monitorRepository.save(Monitor.builder()
            .name("Payment API")
            .type(MonitorType.HTTP)
            .url("https://api.stripe.com/v1/")
            .checkIntervalSeconds(60)
            .timeoutSeconds(8)
            .retryCount(1)
            .failureThreshold(1)
            .expectedStatusCodes(List.of(200, 401))
            .followRedirects(false)
            .tags(List.of("production", "payments", "critical"))
            .status(MonitorStatus.UP)
            .enabled(true)
            .paused(false)
            .sslExpiryDays(210)
            .consecutiveFailures(0)
            .ownerId(adminId)
            .lastCheckedAt(now.minus(45, ChronoUnit.SECONDS))
            .lastStatusChange(now.minus(12, ChronoUnit.DAYS))
            .createdAt(now.minus(30, ChronoUnit.DAYS))
            .updatedAt(now)
            .build());

        Monitor m3 = monitorRepository.save(Monitor.builder()
            .name("User Auth Service")
            .type(MonitorType.KEYWORD)
            .url("https://httpbin.org/get")
            .keyword("url")
            .keywordAbsent(false)
            .checkIntervalSeconds(120)
            .timeoutSeconds(10)
            .retryCount(2)
            .failureThreshold(2)
            .expectedStatusCodes(List.of(200))
            .followRedirects(true)
            .tags(List.of("production", "auth"))
            .status(MonitorStatus.UP)
            .enabled(true)
            .paused(false)
            .sslExpiryDays(115)
            .consecutiveFailures(0)
            .ownerId(adminId)
            .lastCheckedAt(now.minus(55, ChronoUnit.SECONDS))
            .lastStatusChange(now.minus(8, ChronoUnit.DAYS))
            .createdAt(now.minus(30, ChronoUnit.DAYS))
            .updatedAt(now)
            .build());

        Monitor m4 = monitorRepository.save(Monitor.builder()
            .name("Database Server (TCP)")
            .type(MonitorType.TCP)
            .hostname("db.example.com")
            .port(5432)
            .checkIntervalSeconds(30)
            .timeoutSeconds(5)
            .retryCount(3)
            .failureThreshold(3)
            .tags(List.of("production", "database", "critical"))
            .status(MonitorStatus.DOWN)
            .enabled(true)
            .paused(false)
            .consecutiveFailures(4)
            .ownerId(adminId)
            .lastCheckedAt(now.minus(20, ChronoUnit.SECONDS))
            .lastStatusChange(now.minus(2, ChronoUnit.HOURS))
            .createdAt(now.minus(30, ChronoUnit.DAYS))
            .updatedAt(now)
            .build());

        Monitor m5 = monitorRepository.save(Monitor.builder()
            .name("CDN Edge Node")
            .type(MonitorType.HTTP)
            .url("https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js")
            .checkIntervalSeconds(300)
            .timeoutSeconds(15)
            .retryCount(1)
            .failureThreshold(2)
            .expectedStatusCodes(List.of(200))
            .followRedirects(true)
            .tags(List.of("cdn", "static-assets"))
            .status(MonitorStatus.UP)
            .enabled(true)
            .paused(false)
            .sslExpiryDays(62)
            .consecutiveFailures(0)
            .ownerId(adminId)
            .lastCheckedAt(now.minus(3, ChronoUnit.MINUTES))
            .lastStatusChange(now.minus(20, ChronoUnit.DAYS))
            .createdAt(now.minus(30, ChronoUnit.DAYS))
            .updatedAt(now)
            .build());

        Monitor m6 = monitorRepository.save(Monitor.builder()
            .name("Email Relay (SMTP)")
            .type(MonitorType.TCP)
            .hostname("smtp.gmail.com")
            .port(587)
            .checkIntervalSeconds(120)
            .timeoutSeconds(10)
            .retryCount(2)
            .failureThreshold(2)
            .tags(List.of("email", "notifications"))
            .status(MonitorStatus.PAUSED)
            .enabled(true)
            .paused(true)
            .consecutiveFailures(0)
            .ownerId(adminId)
            .lastCheckedAt(now.minus(1, ChronoUnit.HOURS))
            .lastStatusChange(now.minus(1, ChronoUnit.HOURS))
            .createdAt(now.minus(15, ChronoUnit.DAYS))
            .updatedAt(now)
            .build());

        List<Monitor> allMonitors = List.of(m1, m2, m3, m4, m5, m6);
        log.info("Created {} monitors", allMonitors.size());

        // ── 3. Check results (last 24 h, every 5 min) ────────────────────────
        List<CheckResult> results = new ArrayList<>();
        Random rng = new Random(42L); // fixed seed for reproducibility

        for (Monitor monitor : List.of(m1, m2, m3, m4, m5)) {
            int slots = 288; // 24h / 5min
            for (int i = slots; i >= 0; i--) {
                Instant checkedAt = now.minus(i * 5L, ChronoUnit.MINUTES);

                // m4 (DB server) was down for the last 2 hours
                boolean isDown = monitor.getId().equals(m4.getId()) && i < 24;
                // Occasional blip: 2% chance of DOWN for other monitors
                if (!isDown && rng.nextInt(100) < 2) isDown = true;

                MonitorStatus status = isDown ? MonitorStatus.DOWN : MonitorStatus.UP;
                long responseMs = isDown ? 0 : (long)(80 + rng.nextInt(320));
                int httpCode = isDown ? 0 : 200;

                results.add(CheckResult.builder()
                    .monitorId(monitor.getId())
                    .checkedAt(checkedAt)
                    .status(status)
                    .responseTimeMs(responseMs)
                    .httpStatusCode(monitor.getType() == MonitorType.TCP ? null : (isDown ? null : httpCode))
                    .errorMessage(isDown ? (monitor.getType() == MonitorType.TCP
                        ? "Connection refused" : "Connection timed out") : null)
                    .build());
            }
        }
        checkResultRepository.saveAll(results);
        log.info("Created {} check result records", results.size());

        // ── 4. Incidents ──────────────────────────────────────────────────────

        // Resolved incident: Main Website was down for 45 min, 3 days ago
        Instant inc1Start = now.minus(3, ChronoUnit.DAYS);
        Instant inc1Resolved = inc1Start.plus(45, ChronoUnit.MINUTES);
        Incident inc1 = incidentRepository.save(Incident.builder()
            .monitorId(m1.getId())
            .monitorName(m1.getName())
            .status(IncidentStatus.RESOLVED)
            .startedAt(inc1Start)
            .acknowledgedAt(inc1Start.plus(5, ChronoUnit.MINUTES))
            .acknowledgedBy(adminEmail)
            .resolvedAt(inc1Resolved)
            .durationSeconds(45L * 60)
            .cause("Connection timed out after 10s — upstream DNS failure")
            .lastHealthyCheckAt(inc1Start.minus(5, ChronoUnit.MINUTES))
            .createdAt(inc1Start)
            .updatedAt(inc1Resolved)
            .build());

        incidentUpdateRepository.save(IncidentUpdate.builder()
            .incidentId(inc1.getId())
            .message("Investigating connectivity issues with the main website. DNS resolution is failing intermittently.")
            .authorId(adminId)
            .authorName(adminUsername)
            .createdAt(inc1Start.plus(6, ChronoUnit.MINUTES))
            .build());

        incidentUpdateRepository.save(IncidentUpdate.builder()
            .incidentId(inc1.getId())
            .message("Root cause identified: upstream DNS provider had a partial outage. Traffic rerouted to secondary DNS.")
            .authorId(adminId)
            .authorName(adminUsername)
            .createdAt(inc1Start.plus(30, ChronoUnit.MINUTES))
            .build());

        incidentUpdateRepository.save(IncidentUpdate.builder()
            .incidentId(inc1.getId())
            .message("Service fully restored. All checks passing. Monitoring closely for the next hour.")
            .authorId(adminId)
            .authorName(adminUsername)
            .createdAt(inc1Resolved)
            .build());

        // Open incident: Database server DOWN (ongoing, started 2 hours ago)
        Instant inc2Start = now.minus(2, ChronoUnit.HOURS);
        Incident inc2 = incidentRepository.save(Incident.builder()
            .monitorId(m4.getId())
            .monitorName(m4.getName())
            .status(IncidentStatus.ACKNOWLEDGED)
            .startedAt(inc2Start)
            .acknowledgedAt(inc2Start.plus(8, ChronoUnit.MINUTES))
            .acknowledgedBy(adminEmail)
            .cause("Connection refused on port 5432 — database server unreachable")
            .lastHealthyCheckAt(inc2Start.minus(30, ChronoUnit.SECONDS))
            .createdAt(inc2Start)
            .updatedAt(now)
            .build());

        incidentUpdateRepository.save(IncidentUpdate.builder()
            .incidentId(inc2.getId())
            .message("Database server is not accepting connections on port 5432. Investigating potential disk or memory issue on the host.")
            .authorId(adminId)
            .authorName(adminUsername)
            .createdAt(inc2Start.plus(9, ChronoUnit.MINUTES))
            .build());

        incidentUpdateRepository.save(IncidentUpdate.builder()
            .incidentId(inc2.getId())
            .message("Confirmed: disk at 98% capacity causing PostgreSQL to refuse new connections. Clearing old logs now.")
            .authorId(adminId)
            .authorName(adminUsername)
            .createdAt(inc2Start.plus(45, ChronoUnit.MINUTES))
            .build());

        log.info("Created 2 incidents (1 resolved, 1 open)");

        // ── 5. Status Page ────────────────────────────────────────────────────
        statusPageRepository.save(StatusPage.builder()
            .title("ServiceWatch System Status")
            .description("Real-time status of all production services. Updated every 60 seconds.")
            .slug("production-services")
            .monitorIds(List.of(m1.getId(), m2.getId(), m3.getId(), m4.getId(), m5.getId()))
            .isPublic(true)
            .brandingColor("#6366f1")
            .createdBy(adminEmail)
            .createdAt(now.minus(30, ChronoUnit.DAYS))
            .updatedAt(now)
            .build());
        log.info("Created public status page: /status/production-services");

        // ── 6. Notification Channel ───────────────────────────────────────────
        notificationChannelRepository.save(NotificationChannel.builder()
            .name("Admin Email Alerts")
            .type(NotificationType.EMAIL)
            .email(adminEmail)
            .enabled(true)
            .notifyOnDown(true)
            .notifyOnRecovery(true)
            .notifyOnSslExpiry(true)
            .monitorIds(Collections.emptyList()) // watch all monitors
            .createdAt(now.minus(30, ChronoUnit.DAYS))
            .updatedAt(now)
            .build());
        log.info("Created notification channel for {}", adminEmail);

        log.info("=================================================");
        log.info(" Demo data seeded. Login with:");
        log.info("   Email:    {}", adminEmail);
        log.info("   Password: Admin@12345  (change after login!)");
        log.info("=================================================");
    }
}
