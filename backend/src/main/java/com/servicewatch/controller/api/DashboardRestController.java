package com.servicewatch.controller.api;

import com.servicewatch.enums.MonitorStatus;
import com.servicewatch.model.CheckResult;
import com.servicewatch.model.Incident;
import com.servicewatch.model.Monitor;
import com.servicewatch.repository.CheckResultRepository;
import com.servicewatch.repository.IncidentRepository;
import com.servicewatch.service.CheckResultService;
import com.servicewatch.service.MonitorService;
import com.servicewatch.util.UptimeCalculator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardRestController {

    private final MonitorService monitorService;
    private final IncidentRepository incidentRepository;
    private final CheckResultRepository checkResultRepository;
    private final CheckResultService checkResultService;
    private final UptimeCalculator uptimeCalculator;

    public DashboardRestController(MonitorService monitorService,
                                   IncidentRepository incidentRepository,
                                   CheckResultRepository checkResultRepository,
                                   CheckResultService checkResultService,
                                   UptimeCalculator uptimeCalculator) {
        this.monitorService = monitorService;
        this.incidentRepository = incidentRepository;
        this.checkResultRepository = checkResultRepository;
        this.checkResultService = checkResultService;
        this.uptimeCalculator = uptimeCalculator;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalMonitors = monitorService.countTotal();
        long upMonitors = monitorService.countByStatus(MonitorStatus.UP);
        long downMonitors = monitorService.countByStatus(MonitorStatus.DOWN);
        long pausedMonitors = monitorService.countPaused();

        List<Monitor> allMonitors = monitorService.findAll();
        List<Monitor> downList = allMonitors.stream()
                .filter(m -> m.getStatus() == MonitorStatus.DOWN)
                .toList();

        Instant past24h = Instant.now().minus(24, ChronoUnit.HOURS);
        List<CheckResult> recentChecks = checkResultService.findRecentAcrossAll();

        List<CheckResult> checks24h = new ArrayList<>();
        for (Monitor m : allMonitors) {
            checks24h.addAll(checkResultRepository.findByMonitorIdAndCheckedAtBetweenOrderByCheckedAtAsc(m.getId(), past24h, Instant.now()));
        }

        double overallUptime = uptimeCalculator.calculateUptimePercentage(checks24h);
        double avgResponseTime = uptimeCalculator.calculateAverageResponseTime(checks24h);

        List<Incident> recentIncidents = incidentRepository.findTop10ByOrderByStartedAtDesc();

        List<String> chartLabels = new ArrayList<>();
        List<Long> chartData = new ArrayList<>();
        List<CheckResult> displayChecks = new ArrayList<>(recentChecks);
        Collections.reverse(displayChecks);
        for (CheckResult cr : displayChecks) {
            if (cr.getStatus() == MonitorStatus.UP) {
                chartLabels.add(cr.getCheckedAt() != null ? cr.getCheckedAt().toString().substring(11, 19) : "");
                chartData.add(cr.getResponseTimeMs());
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalMonitors", totalMonitors);
        response.put("upMonitors", upMonitors);
        response.put("downMonitors", downMonitors);
        response.put("pausedMonitors", pausedMonitors);
        response.put("overallUptime", Double.parseDouble(String.format(Locale.US, "%.2f", overallUptime)));
        response.put("avgResponseTime", Math.round(avgResponseTime));
        response.put("downList", downList);
        response.put("recentIncidents", recentIncidents);
        response.put("recentChecks", recentChecks);
        response.put("chartLabels", chartLabels);
        response.put("chartData", chartData);

        return ResponseEntity.ok(response);
    }
}
