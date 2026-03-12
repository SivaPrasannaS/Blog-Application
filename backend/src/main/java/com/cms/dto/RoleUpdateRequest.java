package com.cms.dto;

import com.cms.enums.ERole;
import jakarta.validation.constraints.NotNull;

public record RoleUpdateRequest(@NotNull(message = "Role is required") ERole role) {
}