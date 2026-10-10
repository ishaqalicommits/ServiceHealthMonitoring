package com.servicewatch.repository;

import com.servicewatch.enums.IncidentStatus;
import com.servicewatch.model.Incident;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentRepository extends MongoRepository<Incident, String> {

    // Find open incident for a monitor (at most one active incident per monitor)
    Optional<Incident> findFirstByMonitorIdAndStatusOrderByStartedAtDesc(
        String monitorId, IncidentStatus status);

    // All incidents for a monitor
    List<Incident> findByMonitorIdOrderByStartedAtDesc(String monitorId);

    // Filtered and paginated incident list
    Page<Incident> findByStatusOrderByStartedAtDesc(IncidentStatus status, Pageable pageable);
    Page<Incident> findAllByOrderByStartedAtDesc(Pageable pageable);

    // Count open incidents
    long countByStatus(IncidentStatus status);

    // Recent incidents for the dashboard
    List<Incident> findTop10ByOrderByStartedAtDesc();
}
