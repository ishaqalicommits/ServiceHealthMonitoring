package com.servicewatch.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UrlValidatorTest {

    private UrlValidator validator;

    @BeforeEach
    void setUp() {
        validator = new UrlValidator();
    }

    @Test
    @DisplayName("Should accept valid external HTTP and HTTPS URLs")
    void testValidUrls() {
        assertNull(validator.validate("https://google.com"));
        assertNull(validator.validate("https://api.github.com/status"));
        assertNull(validator.validate("http://example.com:8080/test"));
    }

    @Test
    @DisplayName("Should reject invalid or unsupported protocols")
    void testUnsupportedProtocols() {
        assertNotNull(validator.validate("ftp://example.com"));
        assertNotNull(validator.validate("file:///etc/passwd"));
        assertNotNull(validator.validate("javascript:alert(1)"));
    }

    @Test
    @DisplayName("SSRF Defense: Should block localhost, loopback and private networks")
    void testSsrfBlocking() {
        assertNotNull(validator.validate("http://localhost:8080"));
        assertNotNull(validator.validate("http://127.0.0.1:3000"));
        assertNotNull(validator.validate("http://0.0.0.0"));
        assertNotNull(validator.validate("http://169.254.169.254/latest/meta-data/"));
        assertNotNull(validator.validate("https://server.local"));
        assertNotNull(validator.validate("http://metadata.google.internal"));
    }

    @Test
    @DisplayName("Should reject empty or malformed URLs")
    void testEmptyAndMalformed() {
        assertNotNull(validator.validate(""));
        assertNotNull(validator.validate(null));
        assertNotNull(validator.validate("not-a-url"));
    }

    @Test
    @DisplayName("Should validate TCP hostname and ports")
    void testHostnameAndPortValidation() {
        assertNull(validator.validateHostname("example.com"));
        assertNotNull(validator.validateHostname("localhost"));

        assertNull(validator.validatePort(80));
        assertNull(validator.validatePort(443));
        assertNotNull(validator.validatePort(-1));
        assertNotNull(validator.validatePort(70000));
        assertNotNull(validator.validatePort(null));
    }
}
