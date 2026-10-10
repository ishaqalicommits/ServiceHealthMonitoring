package com.servicewatch.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * MongoDB configuration.
 * Spring Boot auto-configures the MongoClient from application.properties,
 * so we only need to enable auditing here.
 *
 * Indexes are created via @CompoundIndex and @Indexed annotations on model classes,
 * with spring.data.mongodb.auto-index-creation=true in application.properties.
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {
    // MongoDB connection is configured via spring.data.mongodb.uri in application.properties
    // Indexes are defined with annotations on the model classes
}
