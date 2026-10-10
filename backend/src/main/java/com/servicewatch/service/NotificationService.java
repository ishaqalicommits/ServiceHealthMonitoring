package com.servicewatch.service;

import com.servicewatch.enums.NotificationEvent;
import com.servicewatch.model.CheckResult;
import com.servicewatch.model.Monitor;
import com.servicewatch.model.NotificationChannel;
import com.servicewatch.model.NotificationLog;
import com.servicewatch.notification.NotificationProvider;
import com.servicewatch.repository.NotificationChannelRepository;
import com.servicewatch.repository.NotificationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Coordinates notification delivery.
 *
 * Alert deduplication:
 * - Does not re-send a DOWN alert for the same monitor within 1 hour
 * - Does not re-send SSL expiry warnings within 24 hours
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final int DOWN_ALERT_DEDUP_MINUTES = 60;
    private static final int SSL_ALERT_DEDUP_HOURS = 24;

    private final NotificationChannelRepository channelRepository;
    private final NotificationLogRepository logRepository;
    private final Map<String, NotificationProvider> providers;

    public NotificationService(
            NotificationChannelRepository channelRepository,
            NotificationLogRepository logRepository,
            List<NotificationProvider> providerList) {
        this.channelRepository = channelRepository;
        this.logRepository = logRepository;
        // Build a map from provider type name to provider for dispatch
        this.providers = providerList.stream()
            .collect(Collectors.toMap(
                p -> p.getType().name(), Function.identity()));
    }

    public void notifyDown(Monitor monitor, CheckResult result) {
        List<NotificationChannel> channels = channelRepository.findByEnabledTrueAndNotifyOnDownTrue();
        String message = String.format("ALERT: %s is DOWN. Error: %s",
            monitor.getName(), result.getErrorMessage());
        sendToChannels(channels, monitor, null, NotificationEvent.DOWN_ALERT, message,
            DOWN_ALERT_DEDUP_MINUTES);
    }

    public void notifyRecovery(Monitor monitor, CheckResult result) {
        List<NotificationChannel> channels = channelRepository.findByEnabledTrueAndNotifyOnRecoveryTrue();
        String message = String.format("RECOVERY: %s is back UP. Response time: %dms",
            monitor.getName(), result.getResponseTimeMs());
        sendToChannels(channels, monitor, null, NotificationEvent.RECOVERY_ALERT, message, 0);
    }

    public void notifySslExpiry(Monitor monitor, int daysUntilExpiry) {
        List<NotificationChannel> channels = channelRepository.findByEnabledTrueAndNotifyOnSslExpiryTrue();
        String message = String.format("SSL WARNING: %s certificate expires in %d days",
            monitor.getName(), daysUntilExpiry);
        sendToChannels(channels, monitor, null, NotificationEvent.SSL_EXPIRY_WARNING, message,
            (int) ChronoUnit.MINUTES.between(Instant.now(),
                Instant.now().plus(SSL_ALERT_DEDUP_HOURS, ChronoUnit.HOURS)));
    }

    public void sendTest(String channelId) {
        NotificationChannel channel = channelRepository.findById(channelId)
            .orElseThrow(() -> new IllegalArgumentException("Notification channel not found"));

        NotificationProvider provider = providers.get(channel.getType().name());
        if (provider == null) {
            throw new IllegalStateException("No provider configured for " + channel.getType());
        }

        String message = "TEST: ServiceWatch notification test for " + channel.getName();
        String status = "SENT";
        String errorMsg = null;

        try {
            provider.send(channel, message, NotificationEvent.TEST);
        } catch (Exception e) {
            status = "FAILED";
            errorMsg = e.getMessage();
            log.error("Test notification failed for channel {}: {}", channel.getName(), e.getMessage());
            throw new RuntimeException("Failed to deliver alert: " + e.getMessage(), e);
        } finally {
            logRepository.save(NotificationLog.builder()
                .channelId(channel.getId())
                .event(NotificationEvent.TEST)
                .message(message)
                .status(status)
                .errorMessage(errorMsg)
                .sentAt(Instant.now())
                .build());
        }
    }

    private void sendToChannels(List<NotificationChannel> channels, Monitor monitor,
                                 String incidentId, NotificationEvent event,
                                 String message, int dedupMinutes) {
        for (NotificationChannel channel : channels) {
            // Deduplication check
            if (dedupMinutes > 0) {
                Instant since = Instant.now().minus(dedupMinutes, ChronoUnit.MINUTES);
                long recentCount = logRepository.countByMonitorIdAndEventAndSentAtAfter(
                    monitor.getId(), event, since);
                if (recentCount > 0) {
                    log.debug("Alert suppressed (dedup) for monitor: {}", monitor.getName());
                    logRepository.save(NotificationLog.builder()
                        .channelId(channel.getId())
                        .monitorId(monitor.getId())
                        .incidentId(incidentId)
                        .event(event)
                        .message(message)
                        .status("SUPPRESSED")
                        .sentAt(Instant.now())
                        .build());
                    continue;
                }
            }

            // Skip channels not watching this specific monitor (if filtered)
            if (channel.getMonitorIds() != null && !channel.getMonitorIds().isEmpty()
                    && !channel.getMonitorIds().contains(monitor.getId())) {
                continue;
            }

            NotificationProvider provider = providers.get(channel.getType().name());
            if (provider == null) {
                log.warn("No provider found for channel type: {}", channel.getType());
                continue;
            }

            String status = "SENT";
            String errorMsg = null;
            try {
                provider.send(channel, message, event);
            } catch (Exception e) {
                status = "FAILED";
                errorMsg = e.getMessage();
                log.error("Notification failed for channel {}: {}", channel.getName(), e.getMessage());
            }

            logRepository.save(NotificationLog.builder()
                .channelId(channel.getId())
                .monitorId(monitor.getId())
                .incidentId(incidentId)
                .event(event)
                .message(message)
                .status(status)
                .errorMessage(errorMsg)
                .sentAt(Instant.now())
                .build());
        }
    }

    public List<NotificationLog> findRecentLogs(int limit) {
        return logRepository.findAllByOrderBySentAtDesc(
            org.springframework.data.domain.PageRequest.of(0, limit)).getContent();
    }
}
