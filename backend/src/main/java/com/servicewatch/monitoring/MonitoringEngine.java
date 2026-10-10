package com.servicewatch.monitoring;

import com.servicewatch.enums.MonitorStatus;
import com.servicewatch.enums.MonitorType;
import com.servicewatch.model.CheckResult;
import com.servicewatch.model.Monitor;
import com.servicewatch.repository.CheckResultRepository;
import com.servicewatch.repository.MonitorRepository;
import com.servicewatch.service.IncidentService;
import com.servicewatch.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Core monitoring orchestrator.
 *
 * Responsibilities:
 * 1. Dispatch monitor checks to the correct MonitorChecker implementation
 * 2. Apply retry logic before declaring a monitor DOWN
 * 3. Track consecutive failures for threshold enforcement
 * 4. Persist check results
 * 5. Detect status transitions (UP->DOWN, DOWN->UP)
 * 6. Coordinate incident creation/resolution with IncidentService
 * 7. Trigger notifications via NotificationService
 * 8. Prevent concurrent duplicate checks (tracks in-progress monitors)
 */
@Service
public class MonitoringEngine {

    private static final Logger log = LoggerFactory.getLogger(MonitoringEngine.class);

    // Maps checker type -> implementation
    private final Map<MonitorType, MonitorChecker> checkers;
    private final CheckResultRepository checkResultRepository;
    private final MonitorRepository monitorRepository;
    private final IncidentService incidentService;
    private final NotificationService notificationService;
    private final SslCertificateChecker sslCertificateChecker;
    private final com.servicewatch.service.MaintenanceService maintenanceService;
    private final com.servicewatch.sse.SseEmitterService sseEmitterService;

    /**
     * Set of monitor IDs currently being checked.
     * ConcurrentHashMap.newKeySet() gives us a thread-safe Set.
     * This prevents running two checks for the same monitor simultaneously.
     */
    private final Set<String> inProgressMonitors = ConcurrentHashMap.newKeySet();

    public MonitoringEngine(
            List<MonitorChecker> checkerList,
            CheckResultRepository checkResultRepository,
            MonitorRepository monitorRepository,
            IncidentService incidentService,
            NotificationService notificationService,
            SslCertificateChecker sslCertificateChecker,
            com.servicewatch.service.MaintenanceService maintenanceService,
            com.servicewatch.sse.SseEmitterService sseEmitterService) {

        // Build a map from MonitorType to checker for O(1) lookup
        this.checkers = checkerList.stream()
            .collect(Collectors.toMap(MonitorChecker::getSupportedType, Function.identity()));

        this.checkResultRepository = checkResultRepository;
        this.monitorRepository = monitorRepository;
        this.incidentService = incidentService;
        this.notificationService = notificationService;
        this.sslCertificateChecker = sslCertificateChecker;
        this.maintenanceService = maintenanceService;
        this.sseEmitterService = sseEmitterService;
    }

    /**
     * Runs a health check for the specified monitor.
     * Called by the scheduler for each due monitor.
     */
    public void runCheck(Monitor monitor) {
        String monitorId = monitor.getId();

        // Skip if a check is already in progress for this monitor
        if (!inProgressMonitors.add(monitorId)) {
            log.debug("Skipping check for {} - previous check still running", monitor.getName());
            return;
        }

        try {
            executeCheck(monitor);
        } finally {
            // Always remove from in-progress set, even if an exception occurs
            inProgressMonitors.remove(monitorId);
        }
    }

    private void executeCheck(Monitor monitor) {
        MonitorType type = monitor.getType();

        // Get the appropriate checker
        MonitorChecker checker = checkers.get(type);
        if (checker == null) {
            // KEYWORD and API use the HTTP checker
            checker = checkers.get(MonitorType.HTTP);
        }
        if (checker == null) {
            log.error("No checker found for monitor type: {}", type);
            return;
        }

        // Apply retry logic
        CheckResult result = executeWithRetry(checker, monitor);

        // For HTTPS monitors: check SSL certificate periodically
        if (type == MonitorType.HTTP || type == MonitorType.KEYWORD || type == MonitorType.API) {
            if (monitor.getUrl() != null && monitor.getUrl().startsWith("https://")) {
                updateSslInfo(monitor);
            }
        }

        // Determine previous status for transition detection
        MonitorStatus previousStatus = monitor.getStatus();
        MonitorStatus newStatus = result.getStatus();

        // Update consecutive failure counter
        int consecutiveFailures = monitor.getConsecutiveFailures();
        if (newStatus == MonitorStatus.DOWN) {
            consecutiveFailures++;
        } else {
            consecutiveFailures = 0;
        }

        // Update the monitor in DB
        monitor.setConsecutiveFailures(consecutiveFailures);
        monitor.setLastCheckedAt(result.getCheckedAt());

        // Only change status after reaching failure threshold
        boolean thresholdReached = consecutiveFailures >= monitor.getFailureThreshold();

        if (newStatus == MonitorStatus.UP && previousStatus != MonitorStatus.UP) {
            // Recovery
            monitor.setStatus(MonitorStatus.UP);
            monitor.setLastStatusChange(Instant.now());
            monitorRepository.save(monitor);

            // Save result first
            checkResultRepository.save(result);

            // Handle recovery
            boolean inMaintenance = maintenanceService.isInMaintenance(monitor.getId());
            incidentService.handleRecovery(monitor, result);
            if (!inMaintenance) {
                notificationService.notifyRecovery(monitor, result);
            }

        } else if (newStatus == MonitorStatus.DOWN && thresholdReached
                   && previousStatus != MonitorStatus.DOWN) {
            // New outage
            monitor.setStatus(MonitorStatus.DOWN);
            monitor.setLastStatusChange(Instant.now());
            monitorRepository.save(monitor);

            checkResultRepository.save(result);

            boolean inMaintenance = maintenanceService.isInMaintenance(monitor.getId());
            incidentService.handleFailure(monitor, result);
            if (!inMaintenance) {
                notificationService.notifyDown(monitor, result);
            }

        } else {
            // No status change, just save the result
            monitorRepository.save(monitor);
            checkResultRepository.save(result);
        }

        log.debug("Check complete: {} -> {} in {}ms",
            monitor.getName(), newStatus, result.getResponseTimeMs());

        // Push real-time update to every connected browser tab
        broadcastCheckResult(monitor, result);
    }

    /** Builds a compact JSON payload and broadcasts it via SSE. */
    private void broadcastCheckResult(Monitor monitor, CheckResult result) {
        try {
            String json = String.format(
                "{\"monitorId\":\"%s\",\"monitorName\":\"%s\",\"status\":\"%s\"," +
                "\"responseTimeMs\":%d,\"checkedAt\":\"%s\",\"error\":%s}",
                safe(monitor.getId()),
                safe(monitor.getName()),
                monitor.getStatus().name(),
                result.getResponseTimeMs(),
                result.getCheckedAt().toString(),
                result.getErrorMessage() == null ? "null" : "\"" + safe(result.getErrorMessage()) + "\""
            );
            sseEmitterService.broadcast("check", json);
        } catch (Exception e) {
            log.debug("SSE broadcast error: {}", e.getMessage());
        }
    }

    private String safe(String s) {
        return s == null ? "" : s.replace("\"", "\\\"").replace("\n", " ");
    }

    /**
     * Executes a check with retry logic.
     * Only retries on DOWN results. Returns the last result.
     */
    private CheckResult executeWithRetry(MonitorChecker checker, Monitor monitor) {
        int maxAttempts = Math.max(1, monitor.getRetryCount() + 1);
        CheckResult lastResult = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            lastResult = checker.check(monitor);
            if (lastResult.getStatus() == MonitorStatus.UP) {
                break; // Success, no need to retry
            }
            if (attempt < maxAttempts) {
                log.debug("Check failed for {}, retrying ({}/{})",
                    monitor.getName(), attempt, maxAttempts);
                try {
                    Thread.sleep(1000L * attempt); // Exponential-ish backoff
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        return lastResult;
    }

    /** Inspects SSL certificate and updates the monitor record. */
    private void updateSslInfo(Monitor monitor) {
        try {
            SslCertificateChecker.SslCheckResult ssl = sslCertificateChecker.checkCertificate(monitor);
            if (ssl != null) {
                monitor.setSslExpiryDays(ssl.daysUntilExpiry());
                if (sslCertificateChecker.needsWarning(ssl.daysUntilExpiry())) {
                    notificationService.notifySslExpiry(monitor, ssl.daysUntilExpiry());
                }
            }
        } catch (Exception e) {
            log.debug("SSL check error for {}: {}", monitor.getName(), e.getMessage());
        }
    }
}
