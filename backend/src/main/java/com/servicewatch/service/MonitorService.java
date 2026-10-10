package com.servicewatch.service;

import com.servicewatch.enums.MonitorStatus;
import com.servicewatch.enums.MonitorType;
import com.servicewatch.model.Monitor;
import com.servicewatch.repository.MonitorRepository;
import com.servicewatch.security.SecurityUtils;
import com.servicewatch.util.UrlValidator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Business logic for monitor management.
 * Handles CRUD, validation, pause/resume, and tag management.
 */
@Service
public class MonitorService {

    private final MonitorRepository monitorRepository;
    private final UrlValidator urlValidator;
    private final SecurityUtils securityUtils;

    public MonitorService(MonitorRepository monitorRepository,
                          UrlValidator urlValidator,
                          SecurityUtils securityUtils) {
        this.monitorRepository = monitorRepository;
        this.urlValidator = urlValidator;
        this.securityUtils = securityUtils;
    }

    public List<Monitor> findAll() {
        return monitorRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Optional<Monitor> findById(String id) {
        return monitorRepository.findById(id);
    }

    public Page<Monitor> findPaginated(int page, int size) {
        return monitorRepository.findAll(
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    public Page<Monitor> searchByName(String name, int page, int size) {
        return monitorRepository.findByNameContainingIgnoreCase(
            name, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    /**
     * Creates and validates a new monitor.
     * @throws IllegalArgumentException if validation fails
     */
    public Monitor createMonitor(Monitor monitor) {
        validate(monitor);

        // Set defaults
        if (monitor.getCheckIntervalSeconds() <= 0) monitor.setCheckIntervalSeconds(60);
        if (monitor.getTimeoutSeconds() <= 0) monitor.setTimeoutSeconds(10);
        if (monitor.getRetryCount() < 0) monitor.setRetryCount(1);
        if (monitor.getFailureThreshold() <= 0) monitor.setFailureThreshold(2);
        if (monitor.getExpectedStatusCodes() == null || monitor.getExpectedStatusCodes().isEmpty()) {
            monitor.setExpectedStatusCodes(List.of(200));
        }

        monitor.setStatus(MonitorStatus.UNKNOWN);
        monitor.setEnabled(true);
        monitor.setPaused(false);
        monitor.setConsecutiveFailures(0);

        // Set owner to current logged-in user
        securityUtils.getCurrentUser().ifPresent(u -> monitor.setOwnerId(u.getId()));

        monitor.setCreatedAt(Instant.now());
        monitor.setUpdatedAt(Instant.now());

        return monitorRepository.save(monitor);
    }

    public Monitor updateMonitor(Monitor monitor) {
        Monitor existing = monitorRepository.findById(monitor.getId())
            .orElseThrow(() -> new IllegalArgumentException("Monitor not found"));

        validate(monitor);

        // Preserve fields that shouldn't be overwritten
        monitor.setStatus(existing.getStatus());
        monitor.setEnabled(existing.isEnabled());
        monitor.setPaused(existing.isPaused());
        monitor.setConsecutiveFailures(existing.getConsecutiveFailures());
        monitor.setLastCheckedAt(existing.getLastCheckedAt());
        monitor.setLastStatusChange(existing.getLastStatusChange());
        monitor.setOwnerId(existing.getOwnerId());
        monitor.setCreatedAt(existing.getCreatedAt());
        monitor.setUpdatedAt(Instant.now());

        return monitorRepository.save(monitor);
    }

    public void deleteMonitor(String id) {
        monitorRepository.deleteById(id);
    }

    public void pauseMonitor(String id) {
        monitorRepository.findById(id).ifPresent(m -> {
            m.setPaused(true);
            m.setStatus(MonitorStatus.PAUSED);
            m.setUpdatedAt(Instant.now());
            monitorRepository.save(m);
        });
    }

    public void resumeMonitor(String id) {
        monitorRepository.findById(id).ifPresent(m -> {
            m.setPaused(false);
            m.setStatus(MonitorStatus.UNKNOWN);
            m.setConsecutiveFailures(0);
            m.setUpdatedAt(Instant.now());
            monitorRepository.save(m);
        });
    }

    /** Returns monitors that are due for checking (enabled and not paused). */
    public List<Monitor> findActiveMonitors() {
        return monitorRepository.findByEnabledTrueAndPausedFalse();
    }

    /** Dashboard statistics */
    public long countByStatus(MonitorStatus status) {
        return monitorRepository.countByStatus(status);
    }

    public long countPaused() {
        return monitorRepository.countByEnabledTrueAndPausedTrue();
    }

    public long countTotal() {
        return monitorRepository.count();
    }

    /** Validates monitor configuration before save. */
    private void validate(Monitor monitor) {
        if (monitor.getName() == null || monitor.getName().isBlank()) {
            throw new IllegalArgumentException("Monitor name is required");
        }
        if (monitor.getType() == null) {
            throw new IllegalArgumentException("Monitor type is required");
        }

        MonitorType type = monitor.getType();

        if (type == MonitorType.HTTP || type == MonitorType.KEYWORD || type == MonitorType.API) {
            String urlError = urlValidator.validate(monitor.getUrl());
            if (urlError != null) throw new IllegalArgumentException(urlError);
        }

        if (type == MonitorType.TCP || type == MonitorType.PING) {
            String hostError = urlValidator.validateHostname(monitor.getHostname());
            if (hostError != null) throw new IllegalArgumentException(hostError);
        }

        if (type == MonitorType.TCP) {
            String portError = urlValidator.validatePort(monitor.getPort());
            if (portError != null) throw new IllegalArgumentException(portError);
        }
    }

    /** Parses comma-separated tags string into a list */
    public List<String> parseTags(String tagsString) {
        if (tagsString == null || tagsString.isBlank()) return List.of();
        return Arrays.stream(tagsString.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .collect(Collectors.toList());
    }

    /** Parses comma-separated expected status codes */
    public List<Integer> parseExpectedStatusCodes(String codesString) {
        if (codesString == null || codesString.isBlank()) return List.of(200);
        try {
            return Arrays.stream(codesString.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Integer::parseInt)
                .collect(Collectors.toList());
        } catch (NumberFormatException e) {
            return List.of(200);
        }
    }
}
