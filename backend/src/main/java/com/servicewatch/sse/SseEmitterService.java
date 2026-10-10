package com.servicewatch.sse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Manages all active SSE (Server-Sent Events) connections.
 *
 * When the monitoring engine finishes a check, it calls broadcast()
 * here. Every connected browser tab immediately receives the update
 * without polling.  This is how Uptime Kuma achieves its live feel.
 */
@Service
public class SseEmitterService {

    private static final Logger log = LoggerFactory.getLogger(SseEmitterService.class);

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final AtomicLong idCounter = new AtomicLong(0);

    /** Called by the SSE controller when a new browser tab connects. */
    public SseEmitter createEmitter() {
        long id = idCounter.incrementAndGet();
        // 5-minute timeout; browser will reconnect automatically
        SseEmitter emitter = new SseEmitter(5 * 60 * 1000L);

        emitter.onCompletion(() -> emitters.remove(id));
        emitter.onTimeout(() -> emitters.remove(id));
        emitter.onError(e -> emitters.remove(id));

        emitters.put(id, emitter);
        log.debug("SSE client connected (id={}), total={}", id, emitters.size());

        // Send an initial heartbeat so the browser knows the connection is alive
        try {
            emitter.send(SseEmitter.event().name("connected").data("{\"status\":\"ok\"}"));
        } catch (IOException e) {
            emitters.remove(id);
        }
        return emitter;
    }

    /**
     * Push a named event with JSON payload to every connected browser.
     * Called from MonitoringEngine after each check.
     */
    public void broadcast(String eventName, String jsonPayload) {
        if (emitters.isEmpty()) return;

        emitters.forEach((id, emitter) -> {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(jsonPayload));
            } catch (Exception e) {
                emitters.remove(id);
            }
        });
    }

    /** Periodic heartbeat — keeps connections alive through proxies/firewalls. */
    @org.springframework.scheduling.annotation.Scheduled(fixedDelay = 25_000)
    public void heartbeat() {
        if (emitters.isEmpty()) return;
        broadcast("heartbeat", "{\"ts\":" + System.currentTimeMillis() + "}");
    }

    public int connectionCount() {
        return emitters.size();
    }
}
