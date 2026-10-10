package com.servicewatch.security;

import com.servicewatch.model.User;
import com.servicewatch.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/** Helper methods for accessing the current authenticated user. */
@Component
public class SecurityUtils {

    private final UserRepository userRepository;

    public SecurityUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** Returns the email of the currently logged-in user, or null. */
    public static String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return auth.getName();
    }

    /** Fetches the full User document for the currently logged-in user. */
    public Optional<User> getCurrentUser() {
        String email = getCurrentUserEmail();
        if (email == null) return Optional.empty();
        return userRepository.findByEmail(email);
    }

    /** Returns true if the current user has the ADMIN role. */
    public static boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
