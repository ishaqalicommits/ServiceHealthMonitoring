package com.servicewatch.controller.api;

import com.servicewatch.model.Incident;
import com.servicewatch.model.Monitor;
import com.servicewatch.model.StatusPage;
import com.servicewatch.repository.StatusPageRepository;
import com.servicewatch.security.SecurityUtils;
import com.servicewatch.service.StatusPageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class StatusPageRestController {

    private final StatusPageService statusPageService;
    private final StatusPageRepository statusPageRepository;

    public StatusPageRestController(StatusPageService statusPageService,
                                    StatusPageRepository statusPageRepository) {
        this.statusPageService = statusPageService;
        this.statusPageRepository = statusPageRepository;
    }

    /**
     * Public Status Page Endpoint - No auth required!
     */
    @GetMapping("/api/public/status/{slug}")
    public ResponseEntity<?> getPublicStatusPage(@PathVariable("slug") String slug) {
        Optional<StatusPage> opt = statusPageService.findBySlug(slug);
        if (opt.isEmpty() || !opt.get().isPublic()) {
            return ResponseEntity.notFound().build();
        }

        StatusPage page = opt.get();
        List<Monitor> rawMonitors = statusPageService.getPublicMonitors(page);
        List<Incident> openIncidents = statusPageService.getOpenIncidents(page);

        // Sanitize monitors for public consumption: only expose name, type, and status
        List<Map<String, Object>> publicMonitors = rawMonitors.stream().map(m -> {
            Map<String, Object> safe = new LinkedHashMap<>();
            safe.put("id", m.getId());
            safe.put("name", m.getName());
            safe.put("type", m.getType().name());
            safe.put("status", m.getStatus().name());
            return safe;
        }).toList();

        boolean allOperational = rawMonitors.stream()
                .allMatch(m -> m.getStatus() == com.servicewatch.enums.MonitorStatus.UP);

        Map<String, Object> pageMap = new LinkedHashMap<>();
        pageMap.put("title", page.getTitle() != null ? page.getTitle() : "System Status");
        pageMap.put("description", page.getDescription() != null ? page.getDescription() : "");
        pageMap.put("slug", page.getSlug());
        pageMap.put("brandingColor", page.getBrandingColor() != null ? page.getBrandingColor() : "#2563eb");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("page", pageMap);
        result.put("monitors", publicMonitors);
        result.put("activeIncidents", openIncidents);
        result.put("allOperational", allOperational);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/status-pages")
    public ResponseEntity<?> listStatusPages() {
        return ResponseEntity.ok(statusPageService.findAll());
    }

    @PostMapping("/api/status-pages")
    public ResponseEntity<?> createStatusPage(@RequestBody StatusPage page) {
        try {
            page.setCreatedBy(SecurityUtils.getCurrentUserEmail());
            page.setCreatedAt(Instant.now());
            page.setUpdatedAt(Instant.now());
            return ResponseEntity.ok(statusPageService.create(page));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/api/status-pages/{id}")
    public ResponseEntity<?> updateStatusPage(@PathVariable("id") String id, @RequestBody StatusPage incoming) {
        return statusPageRepository.findById(id).map(page -> {
            page.setTitle(incoming.getTitle());
            page.setDescription(incoming.getDescription());
            page.setMonitorIds(incoming.getMonitorIds());
            page.setBrandingColor(incoming.getBrandingColor());
            page.setPublic(incoming.isPublic());
            page.setUpdatedAt(Instant.now());
            return ResponseEntity.ok(statusPageService.update(page));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/status-pages/{id}")
    public ResponseEntity<?> deleteStatusPage(@PathVariable("id") String id) {
        statusPageService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Status page deleted"));
    }
}
