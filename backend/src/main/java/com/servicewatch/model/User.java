package com.servicewatch.model;

import com.servicewatch.enums.UserRole;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

/**
 * Represents an authenticated user of the ServiceWatch application.
 * Passwords are stored as BCrypt hashes, never in plain text.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    /** BCrypt hashed password — never store plaintext */
    private String passwordHash;

    private UserRole role;

    /** Base32-encoded TOTP secret (null if 2FA not enabled) */
    private String totpSecret;
    private boolean totpEnabled;

    private String timezone;        // e.g. "Asia/Kolkata"
    private String themePreference; // "light" or "dark"

    private boolean active;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastLoginAt;
}
