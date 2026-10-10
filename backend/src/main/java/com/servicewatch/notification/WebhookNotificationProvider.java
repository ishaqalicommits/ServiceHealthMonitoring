package com.servicewatch.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.servicewatch.enums.NotificationEvent;
import com.servicewatch.enums.NotificationType;
import com.servicewatch.model.NotificationChannel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Sends Uptime Kuma-style rich Webhook & Discord notifications.
 *
 * Automatically detects Discord Webhooks (discord.com / discordapp.com)
 * and formats native Discord Rich Embeds with colored status bars.
 */
@Component
public class WebhookNotificationProvider implements NotificationProvider {

    private static final Logger log = LoggerFactory.getLogger(WebhookNotificationProvider.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NotificationType getType() {
        return NotificationType.WEBHOOK;
    }

    @Override
    public void send(NotificationChannel channel, String message, NotificationEvent event) throws Exception {
        if (channel.getWebhookUrl() == null || channel.getWebhookUrl().isBlank()) {
            throw new IllegalArgumentException("Webhook URL is empty");
        }

        String url = channel.getWebhookUrl().trim();
        if (url.contains("discord.gg/")) {
            throw new IllegalArgumentException("Invalid Webhook URL! You entered a Discord Invite link (discord.gg). Webhooks must be generated in Discord Settings and start with https://discord.com/api/webhooks/...");
        }

        Map<String, Object> payload;
        boolean isDiscord = url.contains("discord.com") || url.contains("discordapp.com");

        if (isDiscord) {
            payload = buildDiscordPayload(message, event);
        } else {
            payload = buildGenericWebhookPayload(message, event);
        }

        String jsonBody = objectMapper.writeValueAsString(payload);

        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.ALWAYS)
            .build();

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .timeout(Duration.ofSeconds(10))
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .header("Content-Type", "application/json")
            .header("User-Agent", "ServiceWatch-Monitor/1.0")
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            log.warn("Webhook dispatch failed with HTTP {} response: {}", response.statusCode(), response.body());
            throw new RuntimeException("Webhook server returned HTTP " + response.statusCode());
        }

        log.info("Webhook alert delivered successfully to {} for event: {}", channel.getName(), event);
    }

    /**
     * Strict Discord Webhook Schema (Uptime Kuma Style)
     * Discord rejects non-standard fields silently if unexpected keys exist.
     */
    private Map<String, Object> buildDiscordPayload(String message, NotificationEvent event) {
        int color;
        String title;
        String emoji;

        switch (event) {
            case DOWN_ALERT:
                color = 15158332; // Red #E74C3C
                title = "🔴 [Down] Service Outage Detected";
                emoji = "🔴";
                break;
            case RECOVERY_ALERT:
                color = 3066993;  // Green #2ECC71
                title = "🟢 [Up] Service Recovered";
                emoji = "🟢";
                break;
            case SSL_EXPIRY_WARNING:
                color = 15844367; // Yellow #F1C40F
                title = "⚠️ [SSL Warning] Certificate Expiry Approaching";
                emoji = "⚠️";
                break;
            case TEST:
            default:
                color = 3447003;  // Blue #3498DB
                title = "🧪 [Test Notification] ServiceWatch Alert Test";
                emoji = "🧪";
                break;
        }

        String formattedTime = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'UTC'")
            .withZone(ZoneOffset.UTC)
            .format(Instant.now());

        // Discord Embed Object (strictly following Discord Webhook API spec)
        Map<String, Object> embed = new HashMap<>();
        embed.put("title", title);
        embed.put("description", message);
        embed.put("color", color);
        embed.put("fields", List.of(
            Map.of("name", "Event", "value", event.name(), "inline", true),
            Map.of("name", "Time", "value", formattedTime, "inline", true)
        ));
        embed.put("footer", Map.of("text", "ServiceWatch Realtime Health Monitoring"));

        // Strict Discord Webhook root object
        Map<String, Object> payload = new HashMap<>();
        payload.put("username", "ServiceWatch Bot");
        payload.put("content", emoji + " **" + title + "**");
        payload.put("embeds", List.of(embed));

        return payload;
    }

    /** Payload for Slack, Teams, and generic HTTP Webhook targets */
    private Map<String, Object> buildGenericWebhookPayload(String message, NotificationEvent event) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("text", message);
        payload.put("content", message);
        payload.put("event", event.name());
        payload.put("timestamp", Instant.now().toString());
        payload.put("source", "ServiceWatch");
        return payload;
    }
}
