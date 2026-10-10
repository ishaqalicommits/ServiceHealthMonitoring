package com.servicewatch.enums;

public enum MonitorType {
    HTTP,       // HTTP/HTTPS check
    TCP,        // TCP port connectivity check
    PING,       // ICMP ping check
    KEYWORD,    // HTTP check + keyword in response body
    API         // External API endpoint monitoring
}
