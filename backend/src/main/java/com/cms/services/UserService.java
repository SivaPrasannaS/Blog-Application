package com.cms.services;

import com.cms.dto.RoleUpdateRequest;
import com.cms.dto.UserResponse;
import com.cms.enums.ERole;
import com.cms.models.AuditLog;
import com.cms.models.Role;
import com.cms.models.User;
import com.cms.repositories.AuditLogRepository;
import com.cms.repositories.RoleRepository;
import com.cms.repositories.UserRepository;
import com.cms.exceptions.ResourceNotFoundException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
            .filter(user -> !user.hasRole(ERole.ROLE_ADMIN.name()))
            .map(this::toResponse)
            .toList();
    }

    public UserResponse assignRole(Long userId, RoleUpdateRequest request, User actor) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        ensureRoleAssignmentAllowed(user, request);
        Role role = roleRepository.findByName(request.role())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.role()));
        user.setRoles(new HashSet<>(Set.of(role)));
        User savedUser = userRepository.save(user);
        auditLogRepository.save(AuditLog.builder()
                .action("ASSIGN_ROLE")
                .performedBy(actor.getUsername())
                .targetType("USER")
                .targetId(String.valueOf(savedUser.getId()))
                .details("Assigned role " + request.role().name() + " to user " + savedUser.getUsername())
                .build());
        return toResponse(savedUser);
    }

    public UserResponse deactivateUser(Long userId, User actor) {
        if (userId.equals(actor.getId())) {
            throw new IllegalArgumentException("You cannot deactivate your own account");
        }
        return updateActiveStatus(userId, actor, false, "DEACTIVATE_USER", "Deactivated user ");
    }

    public UserResponse activateUser(Long userId, User actor) {
        return updateActiveStatus(userId, actor, true, "ACTIVATE_USER", "Activated user ");
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc();
    }

    private void ensureRoleAssignmentAllowed(User user, RoleUpdateRequest request) {
        if (user.hasRole(ERole.ROLE_ADMIN.name())) {
            throw new IllegalArgumentException("Admin account cannot be modified");
        }
        if (request.role() == ERole.ROLE_ADMIN) {
            throw new IllegalArgumentException("Admin role cannot be assigned");
        }
    }

    private UserResponse updateActiveStatus(Long userId, User actor, boolean active, String auditAction, String auditMessagePrefix) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        ensureUserCanBeModified(user);
        user.setActive(active);
        User savedUser = userRepository.save(user);
        auditLogRepository.save(AuditLog.builder()
                .action(auditAction)
                .performedBy(actor.getUsername())
                .targetType("USER")
                .targetId(String.valueOf(savedUser.getId()))
                .details(auditMessagePrefix + savedUser.getUsername())
                .build());
        return toResponse(savedUser);
    }

    private void ensureUserCanBeModified(User user) {
        if (user.hasRole(ERole.ROLE_ADMIN.name())) {
            throw new IllegalArgumentException("Admin account cannot be modified");
        }
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet()),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}

