package com.servicewatch.controller.api;

import com.servicewatch.model.User;
import com.servicewatch.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileRestController {

    private final UserService userService;

    public ProfileRestController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        try {
            User currentUser = userService.getCurrentUser();
            String username = body.get("username");
            String timezone = body.get("timezone");
            String theme = body.get("themePreference");

            User updated = userService.updateProfile(currentUser.getId(), username.trim(), timezone, theme);
            updated.setPasswordHash(null);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        try {
            String currentPassword = body.get("currentPassword");
            String newPassword = body.get("newPassword");
            String confirmPassword = body.get("confirmPassword");

            if (!newPassword.equals(confirmPassword)) {
                return ResponseEntity.badRequest().body(Map.of("error", "New passwords do not match."));
            }
            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters."));
            }

            User currentUser = userService.getCurrentUser();
            userService.changePassword(currentUser.getId(), currentPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
