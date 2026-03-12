package com.cms.controllers;

import com.cms.dto.RoleUpdateRequest;
import com.cms.dto.UserResponse;
import com.cms.models.AuditLog;
import com.cms.services.UserService;
import com.cms.utils.SecurityUtils;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class UserController {

    private final UserService userService;
    private final SecurityUtils securityUtils;

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/users/{id}/role")
    public UserResponse assignRole(@PathVariable Long id, @Valid @RequestBody RoleUpdateRequest request) {
        return userService.assignRole(id, request, securityUtils.getCurrentUserOrThrow());
    }

    @DeleteMapping("/users/{id}")
    public UserResponse deactivateUser(@PathVariable Long id) {
        return userService.deactivateUser(id, securityUtils.getCurrentUserOrThrow());
    }

    @PutMapping("/users/{id}/activate")
    public UserResponse activateUser(@PathVariable Long id) {
        return userService.activateUser(id, securityUtils.getCurrentUserOrThrow());
    }

    @GetMapping("/audit-logs")
    public List<AuditLog> getAuditLogs() {
        return userService.getAuditLogs();
    }
}

