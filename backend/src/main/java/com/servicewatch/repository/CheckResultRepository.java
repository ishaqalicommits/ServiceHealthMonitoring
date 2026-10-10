package com.servicewatch.repository;

import com.servicewatch.enums.MonitorStatus;
import com.servicewatch.model.CheckResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface CheckResultRepository extends MongoRepository<CheckResult, String> {

    // Most recent check for a monitor
    Optional<CheckResult> findFirstByMonitorIdOrderByCheckedAtDesc(String monitorId);

    // Paginated history for a monitor
    Page<CheckResult> findByMonitorIdOrderByCheckedAtDesc(String monitorId, Pageable pageable);

    // History within a date range (for analytics)
    List<CheckResult> findByMonitorIdAndCheckedAtBetweenOrderByCheckedAtAsc(
        String monitorId, Instant from, Instant to);

    // Count results by status for uptime calculation
    long countByMonitorIdAndStatus(String monitorId, MonitorStatus status);
    long countByMonitorIdAndCheckedAtBetween(String monitorId, Instant from, Instant to);
    long countByMonitorIdAndStatusAndCheckedAtBetween(
        String monitorId, MonitorStatus status, Instant from, Instant to);

    // Recent results across all monitors (dashboard)
    List<CheckResult> findTop20ByOrderByCheckedAtDesc();

    // Delete old results for retention policy
    void deleteByCheckedAtBefore(Instant cutoff);

    // Average response time calculation helper
    List<CheckResult> findByMonitorIdAndStatusAndCheckedAtBetween(
        String monitorId, MonitorStatus status, Instant from, Instant to);
}
