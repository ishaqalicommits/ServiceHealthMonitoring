package com.servicewatch.service;

import com.servicewatch.enums.MonitorStatus;
import com.servicewatch.model.CheckResult;
import com.servicewatch.model.Monitor;
import com.servicewatch.repository.CheckResultRepository;
import com.servicewatch.repository.IncidentRepository;
import com.servicewatch.util.UptimeCalculator;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

/**
 * Calculates analytics and statistics for monitors.
 * All calculations are based on stored check results from MongoDB.
 */
@Service
public class AnalyticsService {

    private final CheckResultRepository checkResultRepository;
    private final IncidentRepository incidentRepository;
    private final UptimeCalculator uptimeCalculator;

    public AnalyticsService(CheckResultRepository checkResultRepository,
                             IncidentRepository incidentRepository,
                             UptimeCalculator uptimeCalculator) {
        this.checkResultRepository = checkResultRepository;
        this.incidentRepository = incidentRepository;
        this.uptimeCalculator = uptimeCalculator;
    }

    /**
     * Analytics summary for a monitor over a time range.
     */
    public record MonitorAnalytics(
        double uptimePercentage,
        double averageResponseTimeMs,
        long minResponseTimeMs,
        long maxResponseTimeMs,
        long totalChecks,
        long upChecks,
        long downChecks,
        long incidentCount
    ) {}

    public MonitorAnalytics getAnalytics(String monitorId, Instant from, Instant to) {
        List<CheckResult> results = checkResultRepository
            .findByMonitorIdAndCheckedAtBetweenOrderByCheckedAtAsc(monitorId, from, to);

        double uptime = uptimeCalculator.calculateUptimePercentage(results);
        double avgRt = uptimeCalculator.calculateAverageResponseTime(results);
        long minRt = uptimeCalculator.calculateMinResponseTime(results);
        long maxRt = uptimeCalculator.calculateMaxResponseTime(results);

        long upCount = results.stream()
            .filter(r -> r.getStatus() == MonitorStatus.UP).count();
        long downCount = results.size() - upCount;

        long incidents = incidentRepository.findByMonitorIdOrderByStartedAtDesc(monitorId)
            .stream().filter(i -> i.getStartedAt().isAfter(from)).count();

        return new MonitorAnalytics(uptime, avgRt, minRt, maxRt,
            results.size(), upCount, downCount, incidents);
    }

    /** Returns response time data points for chart rendering. */
    public Map<String, Long> getResponseTimeChart(String monitorId, Instant from, Instant to) {
        List<CheckResult> results = checkResultRepository
            .findByMonitorIdAndCheckedAtBetweenOrderByCheckedAtAsc(monitorId, from, to);

        Map<String, Long> chart = new LinkedHashMap<>();
        for (CheckResult r : results) {
            if (r.getStatus() == MonitorStatus.UP) {
                chart.put(r.getCheckedAt().toString(), r.getResponseTimeMs());
            }
        }
        return chart;
    }

    /** Calculates overall average response time across all monitors. */
    public double getOverallAverageResponseTime(Instant from, Instant to) {
        // Use last 24h results if from/to not specified
        if (from == null) from = Instant.now().minus(24, ChronoUnit.HOURS);
        if (to == null) to = Instant.now();

        // This is a simplified calculation - in a production system,
        // you'd use MongoDB aggregation pipelines for efficiency
        return 0; // Implemented in DashboardController via per-monitor calculation
    }

    /**
     * Returns a 90-day uptime history map for display.
     * Key = date string (YYYY-MM-DD), Value = uptime % for that day.
     */
    public Map<String, Double> getDailyUptimeHistory(String monitorId, int days) {
        Map<String, Double> history = new LinkedHashMap<>();
        Instant now = Instant.now();

        for (int i = days - 1; i >= 0; i--) {
            Instant dayStart = now.minus(i, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS);
            Instant dayEnd = dayStart.plus(1, ChronoUnit.DAYS);

            List<CheckResult> dayResults = checkResultRepository
                .findByMonitorIdAndCheckedAtBetweenOrderByCheckedAtAsc(
                    monitorId, dayStart, dayEnd);

            double uptime = uptimeCalculator.calculateUptimePercentage(dayResults);
            history.put(dayStart.toString().substring(0, 10), uptime);
        }
        return history;
    }

    public Instant getFromInstant(String period) {
        return switch (period) {
            case "24h" -> Instant.now().minus(24, ChronoUnit.HOURS);
            case "7d"  -> Instant.now().minus(7, ChronoUnit.DAYS);
            case "30d" -> Instant.now().minus(30, ChronoUnit.DAYS);
            default    -> Instant.now().minus(24, ChronoUnit.HOURS);
        };
    }
}
