package com.servicewatch.monitoring;

import com.servicewatch.enums.MonitorStatus;
import com.servicewatch.enums.MonitorType;
import com.servicewatch.model.CheckResult;
import com.servicewatch.model.Monitor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * HTTP/HTTPS monitor checker.
 *
 * Sends a real HTTP GET request to the configured URL,
 * measures response time, checks the status code, and
 * optionally checks for a keyword in the response body.
 *
 * Uses Java 11+ HttpClient (built into JDK, no external library needed).
 */
@Component
public class HttpMonitorChecker implements MonitorChecker {

    private static final Logger log = LoggerFactory.getLogger(HttpMonitorChecker.class);

    @Override
    public MonitorType getSupportedType() {
        return MonitorType.HTTP;
    }

    @Override
    public CheckResult check(Monitor monitor) {
        String url = monitor.getUrl();
        int timeoutSeconds = monitor.getTimeoutSeconds() > 0 ? monitor.getTimeoutSeconds() : 10;
        Instant start = Instant.now();

        // Build HttpClient with timeout and redirect policy
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(timeoutSeconds))
            .followRedirects(monitor.isFollowRedirects() ?
                HttpClient.Redirect.NORMAL : HttpClient.Redirect.NEVER)
            .build();

        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .GET()
                // Identify ourselves so servers don't block the user agent
                .header("User-Agent", "ServiceWatch/1.0 (Monitor)")
                .build();

            HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());

            long responseTimeMs = Duration.between(start, Instant.now()).toMillis();
            int statusCode = response.statusCode();

            // Determine if status code is acceptable
            boolean statusOk = isStatusCodeAcceptable(statusCode, monitor.getExpectedStatusCodes());

            // For KEYWORD monitor type: check if keyword exists in body
            boolean keywordOk = true;
            Boolean keywordFound = null;
            if (monitor.getKeyword() != null && !monitor.getKeyword().isBlank()) {
                String body = response.body();
                keywordFound = body != null && body.contains(monitor.getKeyword());
                // keywordAbsent=true means keyword must NOT be present
                keywordOk = monitor.isKeywordAbsent() ? !keywordFound : keywordFound;
            }

            boolean isUp = statusOk && keywordOk;

            String errorMessage = null;
            if (!statusOk) {
                errorMessage = "Unexpected HTTP status: " + statusCode;
                if (monitor.getExpectedStatusCodes() != null && !monitor.getExpectedStatusCodes().isEmpty()) {
                    errorMessage += " (expected: " + monitor.getExpectedStatusCodes() + ")";
                }
            } else if (!keywordOk) {
                errorMessage = monitor.isKeywordAbsent()
                    ? "Keyword found but should be absent: " + monitor.getKeyword()
                    : "Expected keyword not found: " + monitor.getKeyword();
            }

            return CheckResult.builder()
                .monitorId(monitor.getId())
                .checkedAt(start)
                .status(isUp ? MonitorStatus.UP : MonitorStatus.DOWN)
                .responseTimeMs(responseTimeMs)
                .httpStatusCode(statusCode)
                .errorMessage(errorMessage)
                .keywordFound(keywordFound)
                .build();

        } catch (java.net.http.HttpTimeoutException e) {
            long responseTimeMs = Duration.between(start, Instant.now()).toMillis();
            log.debug("Timeout checking {}: {}", url, e.getMessage());
            return CheckResult.builder()
                .monitorId(monitor.getId())
                .checkedAt(start)
                .status(MonitorStatus.DOWN)
                .responseTimeMs(responseTimeMs)
                .errorMessage("Connection timed out after " + timeoutSeconds + "s")
                .build();

        } catch (Exception e) {
            long responseTimeMs = Duration.between(start, Instant.now()).toMillis();
            log.debug("Error checking {}: {}", url, e.getMessage());
            return CheckResult.builder()
                .monitorId(monitor.getId())
                .checkedAt(start)
                .status(MonitorStatus.DOWN)
                .responseTimeMs(responseTimeMs)
                .errorMessage(summarizeError(e))
                .build();
        }
    }

    /**
     * Checks if the returned HTTP status code is in the expected list.
     * If no expected codes are configured, any 2xx code is considered OK.
     */
    private boolean isStatusCodeAcceptable(int statusCode, List<Integer> expectedCodes) {
        if (expectedCodes == null || expectedCodes.isEmpty()) {
            // Default: any 2xx is acceptable
            return statusCode >= 200 && statusCode < 300;
        }
        return expectedCodes.contains(statusCode);
    }

    /** Creates a readable summary of the exception. */
    private String summarizeError(Exception e) {
        if (e instanceof java.net.ConnectException) return "Connection refused";
        if (e instanceof java.net.UnknownHostException) return "Unknown host: " + e.getMessage();
        if (e instanceof javax.net.ssl.SSLException) return "SSL error: " + e.getMessage();
        return e.getClass().getSimpleName() + ": " + e.getMessage();
    }
}
