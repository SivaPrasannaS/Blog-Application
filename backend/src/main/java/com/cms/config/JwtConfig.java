package com.cms.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app")
public record JwtConfig(Jwt jwt, Cors cors) {

    public record Jwt(
            @NotBlank String secret,
            @NotNull Long accessTokenExpirationMs,
            @NotNull Long refreshTokenExpirationMs,
            @NotBlank String issuer
    ) {
    }

    public record Cors(@NotEmpty List<String> allowedOrigins) {
    }
}
