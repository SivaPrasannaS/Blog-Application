package com.cms.services;

import com.cms.dto.JwtResponse;
import com.cms.dto.LoginRequest;
import com.cms.dto.RefreshTokenRequest;
import com.cms.dto.SignupRequest;
import com.cms.enums.ERole;
import com.cms.models.Role;
import com.cms.repositories.RoleRepository;
import com.cms.models.User;
import com.cms.repositories.UserRepository;
import com.cms.utils.JwtUtils;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtUtils jwtUtils;

    public JwtResponse register(SignupRequest request) {
        if (userRepository.existsByUsernameIgnoreCase(request.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new IllegalStateException("Default user role not found"));

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .roles(new HashSet<>(Set.of(userRole)))
                .active(true)
                .build();

        User savedUser = userRepository.save(user);
        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getUsername());
        return buildJwtResponse(savedUser, userDetails);
    }

    public JwtResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid username or password");
        }

        User user = userRepository.findByUsernameAndActiveTrue(request.username())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        return buildJwtResponse(user, userDetails);
    }

    public JwtResponse refresh(RefreshTokenRequest request) {
        if (jwtUtils.isTokenExpired(request.refreshToken()) || !jwtUtils.isRefreshToken(request.refreshToken())) {
            throw new BadCredentialsException("Refresh token is invalid or expired");
        }

        String username = jwtUtils.extractUsername(request.refreshToken());
        User user = userRepository.findByUsernameAndActiveTrue(username)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        return new JwtResponse(
                jwtUtils.generateAccessToken(userDetails),
                jwtUtils.generateRefreshToken(userDetails),
                "Bearer",
                mapUser(user)
        );
    }

    private JwtResponse buildJwtResponse(User user, UserDetails userDetails) {
        return new JwtResponse(
                jwtUtils.generateAccessToken(userDetails),
                jwtUtils.generateRefreshToken(userDetails),
                "Bearer",
                mapUser(user)
        );
    }

    private JwtResponse.UserInfo mapUser(User user) {
        return new JwtResponse.UserInfo(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet()),
                user.isActive()
        );
    }
}

