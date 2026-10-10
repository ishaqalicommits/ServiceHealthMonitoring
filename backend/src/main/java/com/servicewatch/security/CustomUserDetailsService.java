package com.servicewatch.security;

import com.servicewatch.model.User;
import com.servicewatch.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Loads user information for Spring Security authentication.
 * Spring Security calls loadUserByUsername when a user tries to log in.
 *
 * We use the email as the login identifier, but also support username login.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        // Try email first, then username
        User user = userRepository.findByEmail(usernameOrEmail)
            .or(() -> userRepository.findByUsername(usernameOrEmail))
            .orElseThrow(() -> new UsernameNotFoundException(
                "No account found with: " + usernameOrEmail));

        if (!user.isActive()) {
            throw new UsernameNotFoundException("Account is disabled");
        }

        // Spring Security uses roles prefixed with ROLE_
        // So UserRole.ADMIN becomes ROLE_ADMIN
        String authority = "ROLE_" + user.getRole().name();

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())  // Use email as principal
            .password(user.getPasswordHash())
            .authorities(Collections.singletonList(new SimpleGrantedAuthority(authority)))
            .build();
    }
}
