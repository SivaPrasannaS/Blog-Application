package com.cms.dto;

import java.util.Set;

public record JwtResponse(
        String token,
        String refreshToken,
        String type,
        UserInfo user
) {
    public record UserInfo(Long id, String username, String email, Set<String> roles, boolean active) {
    }
}

