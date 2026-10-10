package com.servicewatch.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

/**
 * Configures a bounded thread pool for the monitoring scheduler.
 *
 * Why bounded? Without limits, a large number of slow monitors could
 * create hundreds of threads. A bounded pool ensures the application
 * stays stable even with many monitors configured.
 */
@Configuration
public class SchedulerConfig {

    @Value("${monitoring.thread-pool-size:10}")
    private int threadPoolSize;

    @Bean(name = "monitoringTaskScheduler")
    public ThreadPoolTaskScheduler monitoringTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(threadPoolSize);
        scheduler.setThreadNamePrefix("monitor-");
        scheduler.setAwaitTerminationSeconds(30);
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setErrorHandler(t ->
            org.slf4j.LoggerFactory.getLogger(SchedulerConfig.class)
                .error("Monitoring task error: {}", t.getMessage(), t)
        );
        return scheduler;
    }
}
