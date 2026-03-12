package com.cms.utils;

import com.cms.models.User;
import com.cms.repositories.UserRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public Optional<User> getCurrentUserOptional() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }
        String username = authentication.getName();
        return userRepository.findByUsernameAndActiveTrue(username);
    }

    public User getCurrentUserOrThrow() {
        return getCurrentUserOptional().orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }
}

