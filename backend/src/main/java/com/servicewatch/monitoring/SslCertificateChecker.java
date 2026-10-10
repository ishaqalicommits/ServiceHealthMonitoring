package com.servicewatch.monitoring;

import com.servicewatch.model.Monitor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.net.ssl.*;
import java.net.URL;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * SSL/TLS certificate inspector.
 *
 * For HTTPS monitors, this checks:
 * 1. Days until the certificate expires
 * 2. Whether the certificate is valid (not expired, not self-signed incorrectly)
 *
 * This runs separately from the HTTP health check and updates the monitor's
 * sslExpiryDays field. A warning is generated when < 30 days remain.
 */
@Component
public class SslCertificateChecker {

    private static final Logger log = LoggerFactory.getLogger(SslCertificateChecker.class);
    private static final int SSL_WARNING_DAYS = 30;

    public record SslCheckResult(
        boolean valid,
        int daysUntilExpiry,
        String issuer,
        String subject,
        Instant expiryDate,
        String errorMessage
    ) {}

    /**
     * Inspects the SSL certificate for the given HTTPS URL.
     * Returns null if the URL is not HTTPS.
     */
    public SslCheckResult checkCertificate(Monitor monitor) {
        String urlString = monitor.getUrl();
        if (urlString == null || !urlString.toLowerCase().startsWith("https://")) {
            return null; // Not an HTTPS monitor
        }

        try {
            URL url = new URL(urlString);
            HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
            conn.setConnectTimeout(10_000);
            conn.setReadTimeout(10_000);
            // We only need the certificate, not the response body
            conn.setRequestMethod("HEAD");

            conn.connect();

            Certificate[] certs = conn.getServerCertificates();
            conn.disconnect();

            if (certs == null || certs.length == 0) {
                return new SslCheckResult(false, 0, null, null, null,
                    "No certificates returned");
            }

            // The first certificate is the server's certificate
            X509Certificate serverCert = (X509Certificate) certs[0];
            Date expiryDate = serverCert.getNotAfter();
            Instant expiry = expiryDate.toInstant();
            long daysUntilExpiry = ChronoUnit.DAYS.between(Instant.now(), expiry);

            // Validate: not expired
            boolean notExpired = Instant.now().isBefore(expiry);

            return new SslCheckResult(
                notExpired,
                (int) daysUntilExpiry,
                serverCert.getIssuerX500Principal().getName(),
                serverCert.getSubjectX500Principal().getName(),
                expiry,
                notExpired ? null : "Certificate expired on " + expiryDate
            );

        } catch (Exception e) {
            log.debug("SSL check failed for {}: {}", urlString, e.getMessage());
            return new SslCheckResult(false, 0, null, null, null,
                "SSL check error: " + e.getMessage());
        }
    }

    public boolean needsWarning(int daysUntilExpiry) {
        return daysUntilExpiry >= 0 && daysUntilExpiry <= SSL_WARNING_DAYS;
    }
}
