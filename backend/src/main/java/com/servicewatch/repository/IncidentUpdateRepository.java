package com.servicewatch.repository;

import com.servicewatch.model.IncidentUpdate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentUpdateRepository extends MongoRepository<IncidentUpdate, String> {
    List<IncidentUpdate> findByIncidentIdOrderByCreatedAtAsc(String incidentId);
}
