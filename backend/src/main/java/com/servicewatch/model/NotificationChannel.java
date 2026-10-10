package com.servicewatch.model;

import com.servicewatch.enums.NotificationType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

/**
 * A configured notification destination (email address or webhook URL).
 * Each channel defines which events it receives alerts for.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notificationChannels")
public class NotificationChannel {

    @Id
    private String id;

    private String name;
    private NotificationType type;

    /** For EMAIL channels */
    private String email;

    /** For WEBHOOK channels — stored as config, never logged in full */
    private String webhookUrl;

    private boolean enabled;
    private boolean notifyOnDown;
    private boolean notifyOnRecovery;
    private boolean notifyOnSslExpiry;

    /** Specific monitor IDs to watch (empty = all monitors) */
    private List<String> monitorIds;

    private Instant createdAt;
    private Instant updatedAt;
}
