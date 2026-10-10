package com.servicewatch.controller.api;

import com.servicewatch.model.User;
import com.servicewatch.repository.UserRepository;
import com.servicewatch.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final com.servicewatch.service.UserService userService;
    private final org.springframework.security.web.context.SecurityContextRepository securityContextRepository =
            new org.springframework.security.web.context.HttpSessionSecurityContextRepository();

    public AuthRestController(AuthenticationManager authenticationManager,
                              UserRepository userRepository,
                              SecurityUtils securityUtils,
                              com.servicewatch.service.UserService userService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.securityUtils = securityUtils;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data,
                                      jakarta.servlet.http.HttpServletRequest request,
                                      jakarta.servlet.http.HttpServletResponse response) {
        String username = data.get("username");
        String email = data.get("email");
        String password = data.get("password");

        if (username == null || username.isBlank() || email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username, email, and password are required"));
        }

        if (password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }

        try {
            com.servicewatch.enums.UserRole role = com.servicewatch.enums.UserRole.ADMIN;
            User user = userService.createUser(username.trim(), email.trim(), password, role);

            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), password)
            );
            SecurityContext sc = SecurityContextHolder.createEmptyContext();
            sc.setAuthentication(auth);
            SecurityContextHolder.setContext(sc);
            securityContextRepository.saveContext(sc, request, response);

            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "role", user.getRole().name(),
                    "timezone", user.getTimezone() != null ? user.getTimezone() : "UTC",
                    "themePreference", user.getThemePreference() != null ? user.getThemePreference() : "light"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create account: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials,
                                   jakarta.servlet.http.HttpServletRequest request,
                                   jakarta.servlet.http.HttpServletResponse response) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required"));
        }

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username.trim(), password)
            );

            SecurityContext sc = SecurityContextHolder.createEmptyContext();
            sc.setAuthentication(auth);
            SecurityContextHolder.setContext(sc);
            securityContextRepository.saveContext(sc, request, response);

            Optional<User> userOpt = userRepository.findByEmail(auth.getName())
                    .or(() -> userRepository.findByUsername(auth.getName()));

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                return ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole().name(),
                        "timezone", user.getTimezone() != null ? user.getTimezone() : "UTC",
                        "themePreference", user.getThemePreference() != null ? user.getThemePreference() : "light"
                ));
            }

            return ResponseEntity.ok(Map.of("email", auth.getName(), "role", "ADMIN"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email/username or password"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Optional<User> userOpt = securityUtils.getCurrentUser();
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "role", user.getRole().name(),
                    "timezone", user.getTimezone() != null ? user.getTimezone() : "UTC",
                    "themePreference", user.getThemePreference() != null ? user.getThemePreference() : "light"
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
