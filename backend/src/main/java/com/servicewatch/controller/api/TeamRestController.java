package com.servicewatch.controller.api;

import com.servicewatch.enums.UserRole;
import com.servicewatch.model.User;
import com.servicewatch.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/team")
public class TeamRestController {

    private final UserService userService;

    public TeamRestController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> listTeam() {
        List<User> users = userService.findAll();
        // Hide password hashes from API responses
        users.forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<?> addMember(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String email = body.get("email");
            String password = body.get("password");
            UserRole role = UserRole.valueOf(body.get("role"));

            User created = userService.createUser(username.trim(), email.trim(), password, role);
            created.setPasswordHash(null);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable("id") String id, @RequestBody Map<String, String> body) {
        try {
            UserRole role = UserRole.valueOf(body.get("role"));
            userService.setUserRole(id, role);
            return ResponseEntity.ok(Map.of("message", "Role updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(@PathVariable("id") String id) {
        userService.toggleUserActive(id);
        return ResponseEntity.ok(Map.of("message", "Status updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMember(@PathVariable("id") String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "Member deleted"));
    }
}
