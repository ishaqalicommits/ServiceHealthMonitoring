package com.servicewatch.model;

import com.servicewatch.enums.MonitorStatus;
import com.servicewatch.enums.MonitorType;
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
 * Represents a monitored service configuration.
 * Each monitor defines what to check, how often, and what constitutes success.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "monitors")
public class Monitor {

    @Id
    private String id;

    private String name;

    private MonitorType type;

    /** Full URL for HTTP/HTTPS/API/KEYWORD monitors */
    private String url;

    /** Hostname or IP for TCP/PING monitors */
    private String hostname;

    /** TCP port for TCP monitors */
    private Integer port;

    /** How often to run a check (in seconds). Default: 60 */
    private int checkIntervalSeconds;

    /** Timeout for each check attempt (in seconds). Default: 10 */
    private int timeoutSeconds;

    /** Number of retries before declaring DOWN. Default: 1 */
    private int retryCount;

    /**
     * Number of consecutive failures before creating an incident.
     * Prevents flapping alerts on transient issues.
     */
    private int failureThreshold;

    /** For HTTP checks: acceptable HTTP status codes e.g. [200, 201] */
    private List<Integer> expectedStatusCodes;

    /** For KEYWORD checks: this text must appear in the response body */
    private String keyword;

    /** If true, the keyword must NOT be present (absence check) */
    private boolean keywordAbsent;

    /** Follow HTTP redirects (3xx)? */
    private boolean followRedirects;

    /** Organisational tags e.g. ["production", "api"] */
    private List<String> tags;

    /** Current operational status */
    @Indexed
    private MonitorStatus status;

    /** Whether the monitor is enabled and should be checked */
    private boolean enabled;

    /** Whether the user has manually paused this monitor */
    private boolean paused;

    /** Timestamp of the most recent check */
    private Instant lastCheckedAt;

    /** Timestamp of the most recent status change (UP->DOWN or DOWN->UP) */
    private Instant lastStatusChange;

    /** Days until SSL certificate expiry (null if not yet checked or not HTTPS) */
    private Integer sslExpiryDays;

    /** Running count of consecutive failures; resets on UP */
    private int consecutiveFailures;

    @Indexed
    private String ownerId;

    private Instant createdAt;
    private Instant updatedAt;
}
