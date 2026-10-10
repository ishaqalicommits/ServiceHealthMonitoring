package com.servicewatch.controller.api;

import com.servicewatch.model.CheckResult;
import com.servicewatch.model.Monitor;
import com.servicewatch.repository.CheckResultRepository;
import com.servicewatch.service.AnalyticsService;
import com.servicewatch.service.MonitorService;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsRestController {

    private final MonitorService monitorService;
    private final AnalyticsService analyticsService;
    private final CheckResultRepository checkResultRepository;

    public AnalyticsRestController(MonitorService monitorService,
                                   AnalyticsService analyticsService,
                                   CheckResultRepository checkResultRepository) {
        this.monitorService = monitorService;
        this.analyticsService = analyticsService;
        this.checkResultRepository = checkResultRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAnalytics(
            @RequestParam(value = "monitorId", required = false) String monitorId,
            @RequestParam(value = "period", defaultValue = "24h") String period) {

        List<Monitor> monitors = monitorService.findAll();
        if (monitors.isEmpty()) {
            return ResponseEntity.ok(Map.of("monitors", Collections.emptyList()));
        }

        String selectedMonitorId = (monitorId != null && !monitorId.isBlank()) ? monitorId : monitors.get(0).getId();
        Monitor selectedMonitor = monitorService.findById(selectedMonitorId).orElse(monitors.get(0));

        Instant from = analyticsService.getFromInstant(period);
        Instant to = Instant.now();

        AnalyticsService.MonitorAnalytics analytics = analyticsService.getAnalytics(selectedMonitor.getId(), from, to);
        Map<String, Long> responseTimeChart = analyticsService.getResponseTimeChart(selectedMonitor.getId(), from, to);

        List<String> chartLabels = new ArrayList<>();
        List<Long> chartData = new ArrayList<>();
        responseTimeChart.forEach((time, rt) -> {
            chartLabels.add(time.length() >= 19 ? time.substring(11, 19) : time);
            chartData.add(rt);
        });

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("monitors", monitors);
        result.put("selectedMonitor", selectedMonitor);
        result.put("analytics", analytics);
        result.put("chartLabels", chartLabels);
        result.put("chartData", chartData);
        result.put("period", period);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/export-csv")
    public void exportCsv(
            @RequestParam(value = "monitorId", required = false) String monitorId,
            @RequestParam(value = "period", defaultValue = "24h") String period,
            HttpServletResponse response) throws IOException {

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"servicewatch-metrics-" + period + ".csv\"");

        Instant from = analyticsService.getFromInstant(period);
        Instant to = Instant.now();

        List<CheckResult> results;
        if (monitorId != null && !monitorId.isBlank()) {
            results = checkResultRepository.findByMonitorIdAndCheckedAtBetweenOrderByCheckedAtAsc(monitorId, from, to);
        } else {
            results = checkResultRepository.findTop20ByOrderByCheckedAtDesc();
        }

        try (PrintWriter writer = response.getWriter();
             CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT
                     .withHeader("Timestamp (UTC)", "Monitor ID", "Status", "Response Time (ms)", "HTTP Status", "Error Message"))) {

            for (CheckResult r : results) {
                csvPrinter.printRecord(
                        r.getCheckedAt() != null ? r.getCheckedAt().toString() : "",
                        r.getMonitorId(),
                        r.getStatus(),
                        r.getResponseTimeMs(),
                        r.getHttpStatusCode() != null ? r.getHttpStatusCode() : "N/A",
                        r.getErrorMessage() != null ? r.getErrorMessage() : ""
                );
            }
            csvPrinter.flush();
        }
    }
}
