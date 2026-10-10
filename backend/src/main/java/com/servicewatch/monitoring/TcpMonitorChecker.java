package com.servicewatch.monitoring;

import com.servicewatch.enums.MonitorStatus;
import com.servicewatch.enums.MonitorType;
import com.servicewatch.model.CheckResult;
import com.servicewatch.model.Monitor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.InetSocketAddress;
import java.net.Socket;
import java.time.Duration;
import java.time.Instant;

/**
 * TCP port connectivity checker.
 * Attempts a TCP connection to hostname:port and measures the time to connect.
 * Does NOT send any data — just verifies the port is listening.
 */
@Component
public class TcpMonitorChecker implements MonitorChecker {

    private static final Logger log = LoggerFactory.getLogger(TcpMonitorChecker.class);

    @Override
    public MonitorType getSupportedType() {
        return MonitorType.TCP;
    }

    @Override
    public CheckResult check(Monitor monitor) {
        String hostname = monitor.getHostname();
        int port = monitor.getPort() != null ? monitor.getPort() : 80;
        int timeoutMs = (monitor.getTimeoutSeconds() > 0 ? monitor.getTimeoutSeconds() : 10) * 1000;
        Instant start = Instant.now();

        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(hostname, port), timeoutMs);
            long responseTimeMs = Duration.between(start, Instant.now()).toMillis();

            return CheckResult.builder()
                .monitorId(monitor.getId())
                .checkedAt(start)
                .status(MonitorStatus.UP)
                .responseTimeMs(responseTimeMs)
                .build();

        } catch (java.net.SocketTimeoutException e) {
            long responseTimeMs = Duration.between(start, Instant.now()).toMillis();
            return CheckResult.builder()
                .monitorId(monitor.getId())
                .checkedAt(start)
                .status(MonitorStatus.DOWN)
                .responseTimeMs(responseTimeMs)
                .errorMessage("TCP connection timed out to " + hostname + ":" + port)
                .build();

        } catch (Exception e) {
            long responseTimeMs = Duration.between(start, Instant.now()).toMillis();
            log.debug("TCP check failed for {}:{} - {}", hostname, port, e.getMessage());
            return CheckResult.builder()
                .monitorId(monitor.getId())
                .checkedAt(start)
                .status(MonitorStatus.DOWN)
                .responseTimeMs(responseTimeMs)
                .errorMessage("TCP connection failed: " + e.getMessage())
                .build();
        }
    }
}
