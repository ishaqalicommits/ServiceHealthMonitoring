package com.servicewatch.repository;

import com.servicewatch.model.NotificationChannel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationChannelRepository extends MongoRepository<NotificationChannel, String> {
    List<NotificationChannel> findByEnabledTrue();
    List<NotificationChannel> findByEnabledTrueAndNotifyOnDownTrue();
    List<NotificationChannel> findByEnabledTrueAndNotifyOnRecoveryTrue();
    List<NotificationChannel> findByEnabledTrueAndNotifyOnSslExpiryTrue();
}
