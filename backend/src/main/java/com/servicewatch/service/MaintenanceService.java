package com.servicewatch.service;

import com.servicewatch.model.MaintenanceWindow;
import com.servicewatch.repository.MaintenanceWindowRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class MaintenanceService {

    private final MaintenanceWindowRepository maintenanceWindowRepository;

    public MaintenanceService(MaintenanceWindowRepository maintenanceWindowRepository) {
        this.maintenanceWindowRepository = maintenanceWindowRepository;
    }

    /**
     * Returns true if the given monitor is currently in an active maintenance window.
     * Used by MonitoringEngine to suppress alerts during planned maintenance.
     */
    public boolean isInMaintenance(String monitorId) {
        Instant now = Instant.now();
        List<MaintenanceWindow> activeWindows = maintenanceWindowRepository
            .findByStartTimeBeforeAndEndTimeAfter(now, now);

        return activeWindows.stream().anyMatch(w ->
            w.getMonitorIds() == null || w.getMonitorIds().isEmpty() ||
            w.getMonitorIds().contains(monitorId)
        );
    }

    public MaintenanceWindow create(MaintenanceWindow window) {
        window.setStatus("UPCOMING");
        return maintenanceWindowRepository.save(window);
    }

    public List<MaintenanceWindow> findAll() {
        return maintenanceWindowRepository.findAllByOrderByStartTimeDesc();
    }

    public Optional<MaintenanceWindow> findById(String id) {
        return maintenanceWindowRepository.findById(id);
    }

    public void delete(String id) {
        maintenanceWindowRepository.deleteById(id);
    }

    /** Called by scheduler to update UPCOMING -> ACTIVE -> COMPLETED */
    public void updateStatuses() {
        Instant now = Instant.now();
        maintenanceWindowRepository.findAllByOrderByStartTimeDesc().forEach(w -> {
            String newStatus;
            if (now.isBefore(w.getStartTime())) {
                newStatus = "UPCOMING";
            } else if (now.isAfter(w.getEndTime())) {
                newStatus = "COMPLETED";
            } else {
                newStatus = "ACTIVE";
            }
            if (!newStatus.equals(w.getStatus())) {
                w.setStatus(newStatus);
                maintenanceWindowRepository.save(w);
            }
        });
    }
}
