package com.servicewatch.repository;

import com.servicewatch.model.MaintenanceWindow;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface MaintenanceWindowRepository extends MongoRepository<MaintenanceWindow, String> {
    // Active windows: started before now and ends after now
    List<MaintenanceWindow> findByStartTimeBeforeAndEndTimeAfter(Instant now1, Instant now2);
    List<MaintenanceWindow> findByStatusOrderByStartTimeAsc(String status);
    List<MaintenanceWindow> findAllByOrderByStartTimeDesc();
}
