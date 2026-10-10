package com.servicewatch.service;

import com.servicewatch.enums.IncidentStatus;
import com.servicewatch.enums.MonitorStatus;
import com.servicewatch.model.CheckResult;
import com.servicewatch.model.Incident;
import com.servicewatch.model.Monitor;
import com.servicewatch.repository.CheckResultRepository;
import com.servicewatch.repository.IncidentRepository;
import com.servicewatch.repository.IncidentUpdateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private IncidentUpdateRepository updateRepository;

    @Mock
    private CheckResultRepository checkResultRepository;

    private IncidentService incidentService;

    @BeforeEach
    void setUp() {
        incidentService = new IncidentService(incidentRepository, updateRepository, checkResultRepository);
    }

    @Test
    @DisplayName("Should create new incident when no open incident exists")
    void testHandleFailureCreatesIncident() {
        Monitor monitor = Monitor.builder().id("m-1").name("Payment API").build();
        CheckResult check = CheckResult.builder().checkedAt(Instant.now()).errorMessage("Connection refused").build();

        when(incidentRepository.findFirstByMonitorIdAndStatusOrderByStartedAtDesc("m-1", IncidentStatus.OPEN))
                .thenReturn(Optional.empty());
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> {
            Incident inc = invocation.getArgument(0);
            inc.setId("inc-123");
            return inc;
        });

        Incident incident = incidentService.handleFailure(monitor, check);

        assertNotNull(incident);
        assertEquals("m-1", incident.getMonitorId());
        assertEquals(IncidentStatus.OPEN, incident.getStatus());
        assertEquals("Connection refused", incident.getCause());
        verify(incidentRepository, times(1)).save(any(Incident.class));
    }

    @Test
    @DisplayName("Should NOT create duplicate incident if outage is already OPEN")
    void testDeduplicateOpenIncidents() {
        Monitor monitor = Monitor.builder().id("m-1").name("Payment API").build();
        CheckResult check = CheckResult.builder().checkedAt(Instant.now()).errorMessage("500 Internal Error").build();
        Incident existing = Incident.builder().id("inc-existing").monitorId("m-1").status(IncidentStatus.OPEN).build();

        when(incidentRepository.findFirstByMonitorIdAndStatusOrderByStartedAtDesc("m-1", IncidentStatus.OPEN))
                .thenReturn(Optional.of(existing));

        Incident incident = incidentService.handleFailure(monitor, check);

        assertEquals("inc-existing", incident.getId());
        verify(incidentRepository, never()).save(any(Incident.class));
    }

    @Test
    @DisplayName("Should resolve incident and calculate duration upon recovery")
    void testHandleRecoveryResolvesIncident() {
        Monitor monitor = Monitor.builder().id("m-1").name("Payment API").build();
        CheckResult recovery = CheckResult.builder().status(MonitorStatus.UP).responseTimeMs(150).build();

        Incident openInc = Incident.builder()
                .id("inc-1")
                .monitorId("m-1")
                .status(IncidentStatus.OPEN)
                .startedAt(Instant.now().minusSeconds(120))
                .build();

        when(incidentRepository.findFirstByMonitorIdAndStatusOrderByStartedAtDesc("m-1", IncidentStatus.OPEN))
                .thenReturn(Optional.of(openInc));

        incidentService.handleRecovery(monitor, recovery);

        assertEquals(IncidentStatus.RESOLVED, openInc.getStatus());
        assertNotNull(openInc.getResolvedAt());
        assertNotNull(openInc.getDurationSeconds());
        assertTrue(openInc.getDurationSeconds() >= 120);
        verify(incidentRepository, times(1)).save(openInc);
    }
}
