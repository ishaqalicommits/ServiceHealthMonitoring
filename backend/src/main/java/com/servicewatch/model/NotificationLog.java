package com.servicewatch.model;

import com.servicewatch.enums.NotificationEvent;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

/** Records every notification attempt, including success/failure status. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notificationLogs")
public class NotificationLog {

    @Id
    private String id;

    @Indexed
    private String channelId;

    @Indexed
    private String monitorId;

    private String incidentId;
    private NotificationEvent event;
    private String message;

    /** "SENT", "FAILED", "SUPPRESSED" */
    private String status;
    private String errorMessage;

    private Instant sentAt;
}
