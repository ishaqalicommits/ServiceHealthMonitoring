package com.servicewatch.repository;

import com.servicewatch.model.NotificationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface NotificationLogRepository extends MongoRepository<NotificationLog, String> {
    Page<NotificationLog> findAllByOrderBySentAtDesc(Pageable pageable);
    List<NotificationLog> findByMonitorIdOrderBySentAtDesc(String monitorId);
    // Check if alert was recently sent for this monitor+event (deduplication)
    long countByMonitorIdAndEventAndSentAtAfter(
        String monitorId,
        com.servicewatch.enums.NotificationEvent event,
        Instant since);
}
