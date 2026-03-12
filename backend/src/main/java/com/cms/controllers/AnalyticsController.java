package com.cms.controllers;

import com.cms.services.AnalyticsService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_MANAGER','ROLE_ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public Map<String, Long> getSummary() {
        return analyticsService.getSummary();
    }

    @GetMapping("/monthly")
    public Map<String, Long> getMonthly() {
        return analyticsService.getMonthly();
    }
}

