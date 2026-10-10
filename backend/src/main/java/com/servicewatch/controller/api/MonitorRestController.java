package com.servicewatch.controller.api;

import com.servicewatch.enums.MonitorStatus;
import com.servicewatch.model.CheckResult;
import com.servicewatch.model.Incident;
import com.servicewatch.model.Monitor;
import com.servicewatch.monitoring.MonitoringEngine;
import com.servicewatch.service.AnalyticsService;
import com.servicewatch.service.CheckResultService;
import com.servicewatch.service.IncidentService;
import com.servicewatch.service.MonitorService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/monitors")
public class MonitorRestController {

    private final MonitorService monitorService;
    private final CheckResultService checkResultService;
    private final IncidentService incidentService;
    private final AnalyticsService analyticsService;
    private final MonitoringEngine monitoringEngine;

    public MonitorRestController(MonitorService monitorService,
                                 CheckResultService checkResultService,
                                 IncidentService incidentService,
                                 AnalyticsService analyticsService,
                                 MonitoringEngine monitoringEngine) {
        this.monitorService = monitorService;
        this.checkResultService = checkResultService;
        this.incidentService = incidentService;
        this.analyticsService = analyticsService;
        this.monitoringEngine = monitoringEngine;
    }

    @GetMapping
    public ResponseEntity<?> listMonitors(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(monitorService.searchByName(search.trim(), page, size));
        }
        return ResponseEntity.ok(monitorService.findPaginated(page, size));
    }

    @PostMapping
    public ResponseEntity<?> createMonitor(@RequestBody Monitor monitor) {
        try {
            Monitor created = monitorService.createMonitor(monitor);
            new Thread(() -> monitoringEngine.runCheck(created)).start();
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMonitorDetail(
            @PathVariable("id") String id,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Optional<Monitor> opt = monitorService.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Monitor monitor = opt.get();
        Page<CheckResult> checkResults = checkResultService.findPagedForMonitor(id, page, size);
        List<Incident> incidents = incidentService.findByMonitor(id);

        Instant from24h = Instant.now().minus(24, ChronoUnit.HOURS);
        AnalyticsService.MonitorAnalytics analytics = analyticsService.getAnalytics(id, from24h, Instant.now());
        Map<String, Double> dailyUptime = analyticsService.getDailyUptimeHistory(id, 7);

        List<CheckResult> recentChecks = checkResultService.findForMonitorInRange(id, from24h, Instant.now());
        List<String> chartLabels = new ArrayList<>();
        List<Long> chartData = new ArrayList<>();
        for (CheckResult cr : recentChecks) {
            if (cr.getStatus() == MonitorStatus.UP) {
                chartLabels.add(cr.getCheckedAt() != null ? cr.getCheckedAt().toString().substring(11, 19) : "");
                chartData.add(cr.getResponseTimeMs());
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("monitor", monitor);
        result.put("checkResults", checkResults);
        result.put("incidents", incidents);
        result.put("analytics", analytics);
        result.put("dailyUptime", dailyUptime);
        result.put("chartLabels", chartLabels);
        result.put("chartData", chartData);

        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMonitor(@PathVariable("id") String id, @RequestBody Monitor monitor) {
        try {
            monitor.setId(id);
            Monitor updated = monitorService.updateMonitor(monitor);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMonitor(@PathVariable("id") String id) {
        monitorService.deleteMonitor(id);
        return ResponseEntity.ok(Map.of("message", "Monitor deleted successfully"));
    }

    @PostMapping("/{id}/check-now")
    public ResponseEntity<?> checkNow(@PathVariable("id") String id) {
        Optional<Monitor> opt = monitorService.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        monitoringEngine.runCheck(opt.get());
        return ResponseEntity.ok(Map.of("message", "Health check completed"));
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<?> pauseMonitor(@PathVariable("id") String id) {
        monitorService.pauseMonitor(id);
        return ResponseEntity.ok(Map.of("message", "Monitor paused"));
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<?> resumeMonitor(@PathVariable("id") String id) {
        monitorService.resumeMonitor(id);
        return ResponseEntity.ok(Map.of("message", "Monitor resumed"));
    }
}
