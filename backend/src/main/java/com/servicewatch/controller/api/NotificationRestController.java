package com.servicewatch.controller.api;

import com.servicewatch.model.NotificationChannel;
import com.servicewatch.repository.NotificationChannelRepository;
import com.servicewatch.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationRestController {

    private final NotificationChannelRepository channelRepository;
    private final NotificationService notificationService;

    public NotificationRestController(NotificationChannelRepository channelRepository,
                                      NotificationService notificationService) {
        this.channelRepository = channelRepository;
        this.notificationService = notificationService;
    }

    @GetMapping("/channels")
    public ResponseEntity<?> getChannels() {
        return ResponseEntity.ok(channelRepository.findAll());
    }

    @PostMapping("/channels")
    public ResponseEntity<?> addChannel(@RequestBody NotificationChannel channel) {
        try {
            channel.setEnabled(true);
            channel.setCreatedAt(Instant.now());
            channel.setUpdatedAt(Instant.now());
            NotificationChannel saved = channelRepository.save(channel);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/channels/{id}")
    public ResponseEntity<?> deleteChannel(@PathVariable("id") String id) {
        channelRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Channel deleted"));
    }

    @PostMapping("/channels/{id}/test")
    public ResponseEntity<?> testChannel(@PathVariable("id") String id) {
        try {
            notificationService.sendTest(id);
            return ResponseEntity.ok(Map.of("message", "Test alert triggered"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(@RequestParam(value = "limit", defaultValue = "50") int limit) {
        return ResponseEntity.ok(notificationService.findRecentLogs(limit));
    }
}
