package com.servicewatch.util;

import com.servicewatch.enums.MonitorStatus;
import com.servicewatch.model.CheckResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class UptimeCalculatorTest {

    private UptimeCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new UptimeCalculator();
    }

    @Test
    @DisplayName("Should return 100% uptime for empty list")
    void testEmptyList() {
        assertEquals(100.0, calculator.calculateUptimePercentage(new ArrayList<>()));
        assertEquals(0.0, calculator.calculateAverageResponseTime(new ArrayList<>()));
    }

    @Test
    @DisplayName("Should compute correct uptime percentage")
    void testUptimePercentage() {
        List<CheckResult> results = List.of(
            CheckResult.builder().status(MonitorStatus.UP).responseTimeMs(100).build(),
            CheckResult.builder().status(MonitorStatus.UP).responseTimeMs(120).build(),
            CheckResult.builder().status(MonitorStatus.DOWN).responseTimeMs(0).build(),
            CheckResult.builder().status(MonitorStatus.UP).responseTimeMs(140).build()
        );

        // 3 UP out of 4 = 75.0%
        assertEquals(75.0, calculator.calculateUptimePercentage(results));
    }

    @Test
    @DisplayName("Should calculate average response time only for UP checks")
    void testAverageResponseTime() {
        List<CheckResult> results = List.of(
            CheckResult.builder().status(MonitorStatus.UP).responseTimeMs(100).build(),
            CheckResult.builder().status(MonitorStatus.UP).responseTimeMs(200).build(),
            CheckResult.builder().status(MonitorStatus.DOWN).responseTimeMs(5000).build()
        );

        // (100 + 200) / 2 = 150.0
        assertEquals(150.0, calculator.calculateAverageResponseTime(results));
        assertEquals(100, calculator.calculateMinResponseTime(results));
        assertEquals(200, calculator.calculateMaxResponseTime(results));
    }

    @Test
    @DisplayName("Should correctly count recent consecutive failures")
    void testConsecutiveFailures() {
        List<CheckResult> results = List.of(
            CheckResult.builder().status(MonitorStatus.DOWN).build(),
            CheckResult.builder().status(MonitorStatus.DOWN).build(),
            CheckResult.builder().status(MonitorStatus.UP).build(),
            CheckResult.builder().status(MonitorStatus.DOWN).build()
        );

        assertEquals(2, calculator.countRecentFailures(results));
    }
}
