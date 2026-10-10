package com.servicewatch.controller.api;

import com.servicewatch.model.MaintenanceWindow;
import com.servicewatch.security.SecurityUtils;
import com.servicewatch.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceRestController {

    private final MaintenanceService maintenanceService;

    public MaintenanceRestController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    public ResponseEntity<?> listWindows() {
        return ResponseEntity.ok(maintenanceService.findAll());
    }

    @PostMapping
    public ResponseEntity<?> scheduleWindow(@RequestBody Map<String, Object> body) {
        try {
            String title = (String) body.get("title");
            String description = (String) body.get("description");
            String startTimeStr = (String) body.get("startTimeStr");
            String endTimeStr = (String) body.get("endTimeStr");
            @SuppressWarnings("unchecked")
            List<String> monitorIds = (List<String>) body.get("monitorIds");
            boolean suppressAlerts = body.get("suppressAlerts") != null ? (Boolean) body.get("suppressAlerts") : true;

            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            Instant start = LocalDateTime.parse(startTimeStr, formatter).toInstant(ZoneOffset.UTC);
            Instant end = LocalDateTime.parse(endTimeStr, formatter).toInstant(ZoneOffset.UTC);

            if (end.isBefore(start)) {
                return ResponseEntity.badRequest().body(Map.of("error", "End time must be after start time."));
            }

            MaintenanceWindow window = MaintenanceWindow.builder()
                    .title(title)
                    .description(description)
                    .startTime(start)
                    .endTime(end)
                    .monitorIds(monitorIds != null ? monitorIds : List.of())
                    .suppressAlerts(suppressAlerts)
                    .status("UPCOMING")
                    .createdBy(SecurityUtils.getCurrentUserEmail())
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            return ResponseEntity.ok(maintenanceService.create(window));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWindow(@PathVariable("id") String id) {
        maintenanceService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Maintenance window deleted"));
    }
}
