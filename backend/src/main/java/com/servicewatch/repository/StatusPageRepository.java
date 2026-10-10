package com.servicewatch.repository;

import com.servicewatch.model.StatusPage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StatusPageRepository extends MongoRepository<StatusPage, String> {
    Optional<StatusPage> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
