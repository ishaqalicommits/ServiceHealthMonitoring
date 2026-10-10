package com.servicewatch.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;
import java.util.List;

/**
 * A public-facing status page showing selected monitors' health.
 * Accessible via /status/{slug} without authentication.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "statusPages")
public class StatusPage {

    @Id
    private String id;

    private String title;
    private String description;

    /** URL-safe slug e.g. "my-company-status" → /status/my-company-status */
    @Indexed(unique = true)
    private String slug;

    /** IDs of monitors to display on this page */
    private List<String> monitorIds;

    private boolean isPublic;

    /** Hex colour for branding e.g. "#3B82F6" */
    private String brandingColor;

    private String createdBy;
    private Instant createdAt;
    private Instant updatedAt;
}
