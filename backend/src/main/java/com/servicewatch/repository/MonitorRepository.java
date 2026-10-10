package com.servicewatch.repository;

import com.servicewatch.enums.MonitorStatus;
import com.servicewatch.model.Monitor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MonitorRepository extends MongoRepository<Monitor, String> {
    List<Monitor> findByEnabledTrueAndPausedFalse();
    List<Monitor> findByOwnerId(String ownerId);
    List<Monitor> findByStatus(MonitorStatus status);
    List<Monitor> findByTagsContaining(String tag);
    Page<Monitor> findByNameContainingIgnoreCase(String name, Pageable pageable);
    long countByStatus(MonitorStatus status);
    long countByEnabledTrueAndPausedTrue();
    long countByEnabled(boolean enabled);
}
