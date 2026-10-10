package com.servicewatch.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

/**
 * A scheduled maintenance window during which alerts are suppressed
 * for the selected monitors.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "maintenanceWindows")
public class MaintenanceWindow {

    @Id
    private String id;

    private String title;
    private String description;

    /** UTC start time */
    private Instant startTime;

    /** UTC end time */
    private Instant endTime;

    /** Monitors covered by this window (empty list = all monitors) */
    private List<String> monitorIds;

    /** When true, no alerts fire for covered monitors during this window */
    private boolean suppressAlerts;

    /** "UPCOMING", "ACTIVE", "COMPLETED" */
    private String status;

    private String createdBy;
    private Instant createdAt;
    private Instant updatedAt;
}
