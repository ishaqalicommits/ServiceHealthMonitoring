package com.servicewatch.scheduler;

import com.servicewatch.model.Monitor;
import com.servicewatch.monitoring.MonitoringEngine;
import com.servicewatch.service.MaintenanceService;
import com.servicewatch.service.MonitorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/**
 * Periodically queries monitors due for verification and dispatches
 * them to the bounded thread pool.
 */
@Component
public class MonitorScheduler {

    private static final Logger log = LoggerFactory.getLogger(MonitorScheduler.class);

    private final MonitorService monitorService;
    private final MonitoringEngine monitoringEngine;
    private final MaintenanceService maintenanceService;
    private final ThreadPoolTaskScheduler taskScheduler;

    public MonitorScheduler(MonitorService monitorService,
                            MonitoringEngine monitoringEngine,
                            MaintenanceService maintenanceService,
                            @Qualifier("monitoringTaskScheduler") ThreadPoolTaskScheduler taskScheduler) {
        this.monitorService = monitorService;
        this.monitoringEngine = monitoringEngine;
        this.maintenanceService = maintenanceService;
        this.taskScheduler = taskScheduler;
    }

    /**
     * Checks due monitors every 15 seconds.
     */
    @Scheduled(fixedDelay = 15_000)
    public void runDueChecks() {
        List<Monitor> activeMonitors = monitorService.findActiveMonitors();
        Instant now = Instant.now();
        int submitted = 0;

        for (Monitor monitor : activeMonitors) {
            if (isDue(monitor, now)) {
                taskScheduler.submit(() -> monitoringEngine.runCheck(monitor));
                submitted++;
            }
        }

        if (submitted > 0) {
            log.debug("Dispatched {} health checks to thread pool", submitted);
        }
    }

    /**
     * Updates maintenance window statuses every minute.
     */
    @Scheduled(fixedDelay = 60_000)
    public void updateMaintenanceWindows() {
        maintenanceService.updateStatuses();
    }

    private boolean isDue(Monitor monitor, Instant now) {
        if (monitor.getLastCheckedAt() == null) {
            return true;
        }
        long secondsSinceLastCheck = now.getEpochSecond() - monitor.getLastCheckedAt().getEpochSecond();
        int interval = monitor.getCheckIntervalSeconds() > 0 ? monitor.getCheckIntervalSeconds() : 60;
        return secondsSinceLastCheck >= interval;
    }
}
