package com.servicewatch.monitoring;

import com.servicewatch.model.CheckResult;
import com.servicewatch.model.Monitor;

/**
 * Interface for all monitor checker implementations.
 * Each monitor type (HTTP, TCP, PING) implements this interface.
 * This design allows adding new monitor types without changing the monitoring engine.
 */
public interface MonitorChecker {

    /**
     * Executes a health check for the given monitor and returns the result.
     * Implementations must:
     * - Set checkedAt to Instant.now()
     * - Measure response time accurately
     * - Set status to UP or DOWN
     * - Never throw unchecked exceptions (catch internally, set errorMessage)
     *
     * @param monitor The monitor configuration to check
     * @return A populated CheckResult (never null)
     */
    CheckResult check(Monitor monitor);

    /**
     * Returns the MonitorType this checker handles.
     * Used by MonitoringEngine to dispatch to the correct checker.
     */
    com.servicewatch.enums.MonitorType getSupportedType();
}
