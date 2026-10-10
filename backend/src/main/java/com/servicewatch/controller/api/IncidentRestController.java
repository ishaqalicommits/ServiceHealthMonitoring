package com.servicewatch.controller.api;

import com.servicewatch.enums.IncidentStatus;
import com.servicewatch.model.Incident;
import com.servicewatch.model.IncidentUpdate;
import com.servicewatch.model.User;
import com.servicewatch.security.SecurityUtils;
import com.servicewatch.service.IncidentService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/incidents")
public class IncidentRestController {

    private final IncidentService incidentService;
    private final SecurityUtils securityUtils;

    public IncidentRestController(IncidentService incidentService, SecurityUtils securityUtils) {
        this.incidentService = incidentService;
        this.securityUtils = securityUtils;
    }

    @GetMapping
    public ResponseEntity<?> listIncidents(
            @RequestParam(value = "status", required = false) String statusFilter,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Page<Incident> incidentPage;
        if (statusFilter != null && !statusFilter.isBlank() && !statusFilter.equalsIgnoreCase("ALL")) {
            IncidentStatus status = IncidentStatus.valueOf(statusFilter.toUpperCase());
            incidentPage = incidentService.findByStatusPaged(status, page, size);
        } else {
            incidentPage = incidentService.findAllPaged(page, size);
        }
        return ResponseEntity.ok(incidentPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getIncident(@PathVariable("id") String id) {
        Optional<Incident> opt = incidentService.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Incident incident = opt.get();
        List<IncidentUpdate> updates = incidentService.findUpdatesForIncident(id);
        return ResponseEntity.ok(Map.of("incident", incident, "updates", updates));
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<?> acknowledge(@PathVariable("id") String id) {
        String username = SecurityUtils.getCurrentUserEmail();
        incidentService.acknowledgeIncident(id, username != null ? username : "operator");
        return ResponseEntity.ok(Map.of("message", "Incident acknowledged"));
    }

    @PostMapping("/{id}/update")
    public ResponseEntity<?> addUpdate(@PathVariable("id") String id, @RequestBody Map<String, String> body) {
        String message = body.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }
        User currentUser = securityUtils.getCurrentUser().orElse(null);
        String authorId = currentUser != null ? currentUser.getId() : "system";
        String authorName = currentUser != null ? currentUser.getUsername() : "Operator";

        IncidentUpdate update = incidentService.addUpdate(id, message.trim(), authorId, authorName);
        return ResponseEntity.ok(update);
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<?> resolve(@PathVariable("id") String id) {
        incidentService.findById(id).ifPresent(incident -> {
            incident.setStatus(IncidentStatus.RESOLVED);
            Instant now = Instant.now();
            incident.setResolvedAt(now);
            if (incident.getStartedAt() != null) {
                incident.setDurationSeconds(Duration.between(incident.getStartedAt(), now).getSeconds());
            }
            incident.setUpdatedAt(now);
        });
        return ResponseEntity.ok(Map.of("message", "Incident marked as resolved"));
    }
}
