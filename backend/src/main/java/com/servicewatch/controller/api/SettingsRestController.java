package com.servicewatch.controller.api;

import com.servicewatch.service.CheckResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsRestController {

    private final CheckResultService checkResultService;

    public SettingsRestController(CheckResultService checkResultService) {
        this.checkResultService = checkResultService;
    }

    @PostMapping("/retention/apply")
    public ResponseEntity<?> applyRetention(@RequestBody Map<String, Integer> body) {
        try {
            int retentionDays = body.getOrDefault("retentionDays", 30);
            checkResultService.applyRetentionPolicy(retentionDays);
            return ResponseEntity.ok(Map.of("message", "Checks older than " + retentionDays + " days purged"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
