package com.servicewatch.enums;

public enum MonitorStatus {
    UP,       // Service is responding correctly
    DOWN,     // Service is failing
    PAUSED,   // Monitoring paused by user
    UNKNOWN   // Not yet checked
}
