package com.servicewatch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * ServiceWatch — Real-time Website, API & Network Service Monitoring System
 *
 * This is the Spring Boot entry point. The @SpringBootApplication annotation
 * enables component scanning, auto-configuration and @Configuration processing.
 *
 * @EnableScheduling activates Spring's scheduling support so our
 * MonitorScheduler beans can use @Scheduled annotations.
 */
@SpringBootApplication
@EnableScheduling
@EnableMongoRepositories(basePackages = "com.servicewatch.repository")
public class ServiceWatchApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServiceWatchApplication.class, args);
    }
}
