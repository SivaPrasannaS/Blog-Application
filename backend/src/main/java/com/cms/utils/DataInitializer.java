package com.cms.utils;

import com.cms.enums.ERole;
import com.cms.models.Role;
import com.cms.repositories.RoleRepository;
import com.cms.models.User;
import com.cms.repositories.UserRepository;
import java.util.HashSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        for (ERole roleName : ERole.values()) {
            roleRepository.findByName(roleName)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
        }

        userRepository.findByUsername("admin").orElseGet(() -> {
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new IllegalStateException("Admin role not found during seed"));
            User admin = User.builder()
                    .username("admin")
                    .email("admin@cms.local")
                    .password(passwordEncoder.encode("Admin@123"))
                    .roles(new HashSet<>(Set.of(adminRole)))
                    .active(true)
                    .build();
            return userRepository.save(admin);
        });
    }
}

