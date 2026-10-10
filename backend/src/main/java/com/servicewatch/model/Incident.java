package com.servicewatch.model;

import com.servicewatch.enums.IncidentStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

/**
 * An incident represents a detected service outage.
 * Created when a monitor exceeds its failure threshold.
 * Resolved automatically when the monitor recovers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "incidents")
public class Incident {

    @Id
    private String id;

    @Indexed
    private String monitorId;
    private String monitorName; // Denormalized for efficient display

    @Indexed
    private IncidentStatus status;

    /** When the outage was first detected */
    private Instant startedAt;

    private Instant acknowledgedAt;
    private String acknowledgedBy; // username

    /** When the service recovered */
    private Instant resolvedAt;

    /** Duration in seconds (set when resolved) */
    private Long durationSeconds;

    /** The error message from the first failing check */
    private String cause;

    /** The last check that showed the service was UP (before the outage) */
    private Instant lastHealthyCheckAt;

    private Instant createdAt;
    private Instant updatedAt;
}
