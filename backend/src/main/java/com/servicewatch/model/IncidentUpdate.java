package com.servicewatch.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

/** A status update posted to an incident by an operator or admin. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "incidentUpdates")
public class IncidentUpdate {

    @Id
    private String id;

    @Indexed
    private String incidentId;

    private String message;
    private String authorId;
    private String authorName;
    private Instant createdAt;
}
