package com.servicewatch.service;

import com.servicewatch.enums.IncidentStatus;
import com.servicewatch.model.Incident;
import com.servicewatch.model.Monitor;
import com.servicewatch.model.StatusPage;
import com.servicewatch.repository.IncidentRepository;
import com.servicewatch.repository.MonitorRepository;
import com.servicewatch.repository.StatusPageRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StatusPageService {

    private final StatusPageRepository statusPageRepository;
    private final MonitorRepository monitorRepository;
    private final IncidentRepository incidentRepository;

    public StatusPageService(StatusPageRepository statusPageRepository,
                              MonitorRepository monitorRepository,
                              IncidentRepository incidentRepository) {
        this.statusPageRepository = statusPageRepository;
        this.monitorRepository = monitorRepository;
        this.incidentRepository = incidentRepository;
    }

    public StatusPage create(StatusPage page) {
        if (statusPageRepository.existsBySlug(page.getSlug())) {
            throw new IllegalArgumentException("Slug already in use: " + page.getSlug());
        }
        return statusPageRepository.save(page);
    }

    public Optional<StatusPage> findBySlug(String slug) {
        return statusPageRepository.findBySlug(slug);
    }

    public List<StatusPage> findAll() {
        return statusPageRepository.findAll();
    }

    /**
     * Returns monitors for this status page.
     * If monitorIds is empty → show ALL monitors (auto-include new ones).
     * If monitorIds has entries → show only those specific monitors.
     */
    public List<Monitor> getPublicMonitors(StatusPage page) {
        List<String> ids = page.getMonitorIds();
        if (ids == null || ids.isEmpty()) {
            return monitorRepository.findAll(); // Show all monitors
        }
        return monitorRepository.findAllById(ids);
    }

    /** Returns open incidents for monitors on this status page. */
    public List<Incident> getOpenIncidents(StatusPage page) {
        List<String> ids = page.getMonitorIds();
        boolean showAll = (ids == null || ids.isEmpty());
        return incidentRepository.findAll().stream()
            .filter(i -> i.getStatus() == IncidentStatus.OPEN
                && (showAll || ids.contains(i.getMonitorId())))
            .toList();
    }

    public void delete(String id) {
        statusPageRepository.deleteById(id);
    }

    public StatusPage update(StatusPage page) {
        return statusPageRepository.save(page);
    }
}
