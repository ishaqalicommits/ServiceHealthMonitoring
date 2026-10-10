package com.servicewatch.monitoring;

import com.servicewatch.enums.MonitorStatus;
import com.servicewatch.enums.MonitorType;
import com.servicewatch.model.CheckResult;
import com.servicewatch.model.Monitor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.time.Duration;
import java.time.Instant;

/**
 * ICMP Ping monitor checker.
 *
 * IMPORTANT LIMITATION: Java's InetAddress.isReachable() uses ICMP only when
 * run as root/admin on Linux. On Windows and non-root Linux, it falls back to
 * TCP port 7 (echo). If that fails, it does NOT definitively mean the host
 * is down — port 7 is usually closed.
 *
 * We clearly document this limitation and degrade gracefully.
 * For reliable ICMP, deploy on Linux as root or use TCP checks instead.
 */
@Component
public class PingMonitorChecker implements MonitorChecker {

    private static final Logger log = LoggerFactory.getLogger(PingMonitorChecker.class);
    private static final int PING_TIMEOUT_MS = 5000;

    @Override
    public MonitorType getSupportedType() {
        return MonitorType.PING;
    }

    @Override
    public CheckResult check(Monitor monitor) {
        String hostname = monitor.getHostname();
        int timeoutMs = (monitor.getTimeoutSeconds() > 0 ? monitor.getTimeoutSeconds() : 5) * 1000;
        Instant start = Instant.now();

        try {
            InetAddress addr = InetAddress.getByName(hostname);
            boolean reachable = addr.isReachable(timeoutMs);
            long responseTimeMs = Duration.between(start, Instant.now()).toMillis();

            if (reachable) {
                return CheckResult.builder()
                    .monitorId(monitor.getId())
                    .checkedAt(start)
                    .status(MonitorStatus.UP)
                    .responseTimeMs(responseTimeMs)
                    .build();
            } else {
                return CheckResult.builder()
                    .monitorId(monitor.getId())
                    .checkedAt(start)
                    .status(MonitorStatus.DOWN)
                    .responseTimeMs(responseTimeMs)
                    .errorMessage("Host unreachable (ICMP/TCP-7 probe failed) - Note: " +
                        "ICMP ping requires admin/root privileges on Windows/Linux")
                    .build();
            }

        } catch (Exception e) {
            long responseTimeMs = Duration.between(start, Instant.now()).toMillis();
            log.debug("Ping check failed for {}: {}", hostname, e.getMessage());
            return CheckResult.builder()
                .monitorId(monitor.getId())
                .checkedAt(start)
                .status(MonitorStatus.DOWN)
                .responseTimeMs(responseTimeMs)
                .errorMessage("Ping failed: " + e.getMessage())
                .build();
        }
    }
}
