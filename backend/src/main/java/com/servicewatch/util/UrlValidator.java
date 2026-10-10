package com.servicewatch.util;

import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

/**
 * SSRF-Safe URL Validator
 *
 * Server-Side Request Forgery (SSRF) occurs when an attacker tricks the server
 * into making HTTP requests to internal infrastructure (localhost, 169.254.x.x,
 * internal IPs, metadata endpoints like AWS 169.254.169.254).
 *
 * This validator:
 * 1. Only allows http:// and https:// schemes
 * 2. Blocks localhost, 127.x.x.x, ::1
 * 3. Blocks private RFC-1918 ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
 * 4. Blocks cloud metadata endpoints (169.254.169.254)
 * 5. Blocks internal hostnames (.local, .internal, .localhost)
 *
 * For a student deployment, this is a reasonable first defense.
 * Production systems should also use network-level egress controls.
 */
@Component
public class UrlValidator {

    private static final List<String> BLOCKED_HOST_PATTERNS = Arrays.asList(
        "localhost", "127.", "0.0.0.0", "::1",
        "169.254.",          // Link-local (AWS metadata: 169.254.169.254)
        "metadata.google",   // GCP metadata
        "metadata.internal"  // GCP internal
    );

    private static final List<String> BLOCKED_SUFFIXES = Arrays.asList(
        ".local", ".internal", ".localhost", ".corp"
    );

    /**
     * Validates a URL for safe monitoring.
     * @return null if valid, or an error message if invalid
     */
    public String validate(String urlString) {
        if (urlString == null || urlString.isBlank()) {
            return "URL cannot be empty";
        }

        URL url;
        try {
            url = new URL(urlString.trim());
        } catch (MalformedURLException e) {
            return "Invalid URL format: " + e.getMessage();
        }

        // Only allow http and https
        String scheme = url.getProtocol().toLowerCase();
        if (!scheme.equals("http") && !scheme.equals("https")) {
            return "Only HTTP and HTTPS URLs are allowed";
        }

        String host = url.getHost().toLowerCase();
        if (host == null || host.isBlank()) {
            return "URL must contain a valid hostname";
        }

        // Block by hostname pattern
        for (String blocked : BLOCKED_HOST_PATTERNS) {
            if (host.equals(blocked) || host.startsWith(blocked)) {
                return "Monitoring internal/private addresses is not allowed: " + host;
            }
        }

        // Block by suffix
        for (String suffix : BLOCKED_SUFFIXES) {
            if (host.endsWith(suffix)) {
                return "Monitoring internal hostnames is not allowed: " + host;
            }
        }

        // Block private IP ranges by resolving (catches numeric IPs)
        try {
            InetAddress addr = InetAddress.getByName(host);
            if (isPrivateAddress(addr)) {
                return "Monitoring private IP addresses is not allowed: " + addr.getHostAddress();
            }
        } catch (Exception e) {
            // DNS resolution failed — allow the URL (the check will fail naturally)
            // Don't block monitors for unresolvable hosts at add time
        }

        // Validate port range
        int port = url.getPort();
        if (port != -1 && (port < 1 || port > 65535)) {
            return "Invalid port number: " + port;
        }

        return null; // null means valid
    }

    private boolean isPrivateAddress(InetAddress addr) {
        return addr.isLoopbackAddress()
            || addr.isSiteLocalAddress()
            || addr.isLinkLocalAddress()
            || addr.isAnyLocalAddress();
    }

    /** Validates a hostname for TCP/Ping monitors */
    public String validateHostname(String hostname) {
        if (hostname == null || hostname.isBlank()) {
            return "Hostname cannot be empty";
        }
        String host = hostname.trim().toLowerCase();
        for (String blocked : BLOCKED_HOST_PATTERNS) {
            if (host.equals(blocked) || host.startsWith(blocked)) {
                return "Internal/private addresses are not allowed: " + host;
            }
        }
        return null;
    }

    /** Validates a TCP port number */
    public String validatePort(Integer port) {
        if (port == null) return "Port is required for TCP monitors";
        if (port < 1 || port > 65535) return "Port must be between 1 and 65535";
        return null;
    }
}
