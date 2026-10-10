package com.servicewatch.service;

import com.servicewatch.enums.IncidentStatus;
import com.servicewatch.model.CheckResult;
import com.servicewatch.model.Incident;
import com.servicewatch.model.IncidentUpdate;
import com.servicewatch.model.Monitor;
import com.servicewatch.repository.CheckResultRepository;
import com.servicewatch.repository.IncidentRepository;
import com.servicewatch.repository.IncidentUpdateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Manages the incident lifecycle:
 * OPEN -> ACKNOWLEDGED -> RESOLVED
 *
 * Key rule: Only one OPEN incident per monitor at any time.
 * This prevents duplicate incidents for ongoing outages.
 */
@Service
public class IncidentService {

    private static final Logger log = LoggerFactory.getLogger(IncidentService.class);

    private final IncidentRepository incidentRepository;
    private final IncidentUpdateRepository updateRepository;
    private final CheckResultRepository checkResultRepository;

    public IncidentService(IncidentRepository incidentRepository,
                           IncidentUpdateRepository updateRepository,
                           CheckResultRepository checkResultRepository) {
        this.incidentRepository = incidentRepository;
        this.updateRepository = updateRepository;
        this.checkResultRepository = checkResultRepository;
    }

    /**
     * Called when a monitor's failure threshold is reached.
     * Creates a new incident if one doesn't already exist (deduplication).
     */
    public Incident handleFailure(Monitor monitor, CheckResult failingCheck) {
        // Check if there's already an open incident for this monitor
        Optional<Incident> existing = incidentRepository
            .findFirstByMonitorIdAndStatusOrderByStartedAtDesc(
                monitor.getId(), IncidentStatus.OPEN);

        if (existing.isPresent()) {
            // Don't create duplicate incidents
            log.debug("Incident already open for monitor: {}", monitor.getName());
            return existing.get();
        }

        // Find the last known UP check
        Optional<CheckResult> lastHealthy = checkResultRepository
            .findFirstByMonitorIdOrderByCheckedAtDesc(monitor.getId());

        Incident incident = Incident.builder()
            .monitorId(monitor.getId())
            .monitorName(monitor.getName())
            .status(IncidentStatus.OPEN)
            .startedAt(failingCheck.getCheckedAt())
            .cause(failingCheck.getErrorMessage())
            .lastHealthyCheckAt(lastHealthy.map(CheckResult::getCheckedAt).orElse(null))
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();

        incident = incidentRepository.save(incident);
        log.info("Incident created for monitor: {} - {}", monitor.getName(), failingCheck.getErrorMessage());

        // Link the check result to this incident
        failingCheck.setIncidentId(incident.getId());
        checkResultRepository.save(failingCheck);

        return incident;
    }

    /**
     * Called when a monitor recovers (check result is UP after being DOWN).
     * Resolves the open incident.
     */
    public void handleRecovery(Monitor monitor, CheckResult recoveryCheck) {
        incidentRepository
            .findFirstByMonitorIdAndStatusOrderByStartedAtDesc(
                monitor.getId(), IncidentStatus.OPEN)
            .ifPresent(incident -> {
                Instant now = Instant.now();
                incident.setStatus(IncidentStatus.RESOLVED);
                incident.setResolvedAt(now);
                incident.setDurationSeconds(
                    Duration.between(incident.getStartedAt(), now).getSeconds());
                incident.setUpdatedAt(now);
                incidentRepository.save(incident);
                log.info("Incident resolved for monitor: {}", monitor.getName());
            });
    }

    public void acknowledgeIncident(String incidentId, String acknowledgedByUsername) {
        incidentRepository.findById(incidentId).ifPresent(incident -> {
            incident.setStatus(IncidentStatus.ACKNOWLEDGED);
            incident.setAcknowledgedAt(Instant.now());
            incident.setAcknowledgedBy(acknowledgedByUsername);
            incident.setUpdatedAt(Instant.now());
            incidentRepository.save(incident);
        });
    }

    public IncidentUpdate addUpdate(String incidentId, String message,
                                    String authorId, String authorName) {
        IncidentUpdate update = IncidentUpdate.builder()
            .incidentId(incidentId)
            .message(message)
            .authorId(authorId)
            .authorName(authorName)
            .createdAt(Instant.now())
            .build();
        return updateRepository.save(update);
    }

    public Optional<Incident> findById(String id) {
        return incidentRepository.findById(id);
    }

    public List<IncidentUpdate> findUpdatesForIncident(String incidentId) {
        return updateRepository.findByIncidentIdOrderByCreatedAtAsc(incidentId);
    }

    public Page<Incident> findAllPaged(int page, int size) {
        return incidentRepository.findAllByOrderByStartedAtDesc(
            PageRequest.of(page, size));
    }

    public Page<Incident> findByStatusPaged(IncidentStatus status, int page, int size) {
        return incidentRepository.findByStatusOrderByStartedAtDesc(
            status, PageRequest.of(page, size));
    }

    public List<Incident> findByMonitor(String monitorId) {
        return incidentRepository.findByMonitorIdOrderByStartedAtDesc(monitorId);
    }

    public List<Incident> findRecent() {
        return incidentRepository.findTop10ByOrderByStartedAtDesc();
    }

    public long countOpen() {
        return incidentRepository.countByStatus(IncidentStatus.OPEN);
    }
}
