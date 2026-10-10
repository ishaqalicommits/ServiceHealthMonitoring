package com.servicewatch.service;

import com.servicewatch.model.CheckResult;
import com.servicewatch.repository.CheckResultRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class CheckResultService {

    private final CheckResultRepository checkResultRepository;

    public CheckResultService(CheckResultRepository checkResultRepository) {
        this.checkResultRepository = checkResultRepository;
    }

    public Optional<CheckResult> findLatestForMonitor(String monitorId) {
        return checkResultRepository.findFirstByMonitorIdOrderByCheckedAtDesc(monitorId);
    }

    public Page<CheckResult> findPagedForMonitor(String monitorId, int page, int size) {
        return checkResultRepository.findByMonitorIdOrderByCheckedAtDesc(
            monitorId, PageRequest.of(page, size));
    }

    public List<CheckResult> findForMonitorInRange(String monitorId, Instant from, Instant to) {
        return checkResultRepository
            .findByMonitorIdAndCheckedAtBetweenOrderByCheckedAtAsc(monitorId, from, to);
    }

    public List<CheckResult> findRecentAcrossAll() {
        return checkResultRepository.findTop20ByOrderByCheckedAtDesc();
    }

    /** Deletes check results older than retentionDays. Part of data retention policy. */
    public void applyRetentionPolicy(int retentionDays) {
        Instant cutoff = Instant.now().minus(retentionDays, ChronoUnit.DAYS);
        checkResultRepository.deleteByCheckedAtBefore(cutoff);
    }
}
