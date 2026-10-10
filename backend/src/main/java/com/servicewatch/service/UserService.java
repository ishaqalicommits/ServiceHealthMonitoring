package com.servicewatch.service;

import com.servicewatch.enums.UserRole;
import com.servicewatch.model.User;
import com.servicewatch.repository.UserRepository;
import com.servicewatch.security.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Business logic for user management.
 * Handles registration, password changes, role management.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       SecurityUtils securityUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityUtils = securityUtils;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User getCurrentUser() {
        return securityUtils.getCurrentUser()
            .orElseThrow(() -> new RuntimeException("Not authenticated"));
    }

    /**
     * Creates a new user with hashed password.
     * Validates uniqueness of email and username.
     */
    public User createUser(String username, String email, String rawPassword, UserRole role) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered: " + email);
        }
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already taken: " + username);
        }

        User user = User.builder()
            .username(username)
            .email(email)
            .passwordHash(passwordEncoder.encode(rawPassword))
            .role(role)
            .active(true)
            .totpEnabled(false)
            .timezone("UTC")
            .themePreference("light")
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();

        return userRepository.save(user);
    }

    /**
     * Changes a user's password.
     * currentPassword is verified before the change is applied.
     */
    public void changePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }

    public User updateProfile(String userId, String username, String timezone, String theme) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getUsername().equals(username) && userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already taken");
        }

        user.setUsername(username);
        user.setTimezone(timezone);
        user.setThemePreference(theme);
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    public void setUserRole(String userId, UserRole role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(role);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }

    public void toggleUserActive(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setActive(!user.isActive());
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }

    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    public void recordLogin(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setLastLoginAt(Instant.now());
            userRepository.save(user);
        });
    }
}
