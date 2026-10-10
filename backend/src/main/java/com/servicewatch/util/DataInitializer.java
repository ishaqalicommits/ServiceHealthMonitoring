package com.servicewatch.util;

import com.servicewatch.enums.UserRole;
import com.servicewatch.model.User;
import com.servicewatch.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Creates the first admin user on startup if the user collection is empty.
 *
 * This runs ONCE when no users exist. After the admin logs in and changes
 * the password, this initializer has no further effect.
 *
 * Credentials are read from environment variables:
 *   FIRST_ADMIN_EMAIL, FIRST_ADMIN_PASSWORD, FIRST_ADMIN_USERNAME
 */
@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.first-admin.email:admin@servicewatch.local}")
    private String adminEmail;

    @Value("${app.first-admin.password:Admin@12345}")
    private String adminPassword;

    @Value("${app.first-admin.username:admin}")
    private String adminUsername;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() == 0) {
            log.info("No users found. Creating first admin account: {}", adminEmail);

            User admin = User.builder()
                .username(adminUsername)
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(UserRole.ADMIN)
                .active(true)
                .totpEnabled(false)
                .timezone("UTC")
                .themePreference("light")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

            userRepository.save(admin);

            log.info("==================================================");
            log.info(" First admin created. Login with:");
            log.info("   Email:    {}", adminEmail);
            log.info("   Password: [set via FIRST_ADMIN_PASSWORD env var]");
            log.info(" IMPORTANT: Change the password after first login!");
            log.info("==================================================");
        }
    }
}
