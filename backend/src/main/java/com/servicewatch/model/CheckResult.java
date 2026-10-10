package com.servicewatch.model;

import com.servicewatch.enums.MonitorStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

/**
 * One health-check result for one monitor at one point in time.
 * These are stored separately from the monitor document to avoid
 * unbounded document growth. They are paginated in the UI.
 *
 * The compound index on (monitorId, checkedAt) allows efficient
 * queries like "give me the last 100 results for monitor X".
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "checkResults")
@CompoundIndexes({
    @CompoundIndex(name = "monitor_time", def = "{'monitorId': 1, 'checkedAt': -1}")
})
public class CheckResult {

    @Id
    private String id;

    @Indexed
    private String monitorId;

    private Instant checkedAt;

    private MonitorStatus status; // UP or DOWN

    /** Response time in milliseconds */
    private long responseTimeMs;

    /** HTTP status code (null for TCP/PING checks) */
    private Integer httpStatusCode;

    /** Error description when status is DOWN */
    private String errorMessage;

    /** For keyword checks: was the keyword found? */
    private Boolean keywordFound;

    /** Link to an incident if this check created or belongs to an active incident */
    private String incidentId;
}
