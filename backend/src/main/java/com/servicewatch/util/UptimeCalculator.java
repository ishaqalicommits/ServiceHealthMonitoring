package com.servicewatch.util;

import com.servicewatch.enums.MonitorStatus;
import com.servicewatch.model.CheckResult;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Calculates uptime statistics from a list of check results.
 *
 * Uptime percentage = (UP checks / total checks) * 100
 *
 * Note: This calculation is based on recorded check results only.
 * If the scheduler was not running for a period, that time is not
 * counted as uptime or downtime. This is documented as a known limitation.
 */
@Component
public class UptimeCalculator {

    /**
     * Calculates uptime percentage from check results.
     * @return 0.0 to 100.0, or 100.0 if no results exist
     */
    public double calculateUptimePercentage(List<CheckResult> results) {
        if (results == null || results.isEmpty()) {
            return 100.0; // No data = assume operational
        }
        long upCount = results.stream()
            .filter(r -> r.getStatus() == MonitorStatus.UP)
            .count();
        return (upCount * 100.0) / results.size();
    }

    /**
     * Calculates average response time in milliseconds for UP checks only.
     * Returns 0 if no UP results exist.
     */
    public double calculateAverageResponseTime(List<CheckResult> results) {
        if (results == null || results.isEmpty()) return 0;
        return results.stream()
            .filter(r -> r.getStatus() == MonitorStatus.UP)
            .mapToLong(CheckResult::getResponseTimeMs)
            .average()
            .orElse(0);
    }

    public long calculateMinResponseTime(List<CheckResult> results) {
        if (results == null || results.isEmpty()) return 0;
        return results.stream()
            .filter(r -> r.getStatus() == MonitorStatus.UP)
            .mapToLong(CheckResult::getResponseTimeMs)
            .min().orElse(0);
    }

    public long calculateMaxResponseTime(List<CheckResult> results) {
        if (results == null || results.isEmpty()) return 0;
        return results.stream()
            .filter(r -> r.getStatus() == MonitorStatus.UP)
            .mapToLong(CheckResult::getResponseTimeMs)
            .max().orElse(0);
    }

    /** Count of consecutive failures (from most recent backwards) */
    public int countRecentFailures(List<CheckResult> results) {
        int count = 0;
        // Results should be ordered newest-first
        for (CheckResult r : results) {
            if (r.getStatus() == MonitorStatus.DOWN) count++;
            else break;
        }
        return count;
    }
}
