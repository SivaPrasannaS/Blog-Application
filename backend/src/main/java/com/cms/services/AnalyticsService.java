package com.cms.services;

import com.cms.repositories.CategoryRepository;
import com.cms.repositories.PostRepository;
import com.cms.enums.PostStatus;
import com.cms.repositories.UserRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PostService postService;

    public Map<String, Long> getSummary() {
        Map<String, Long> summary = new LinkedHashMap<>();
        summary.put("totalPosts", postRepository.count());
        summary.put("draftPosts", postRepository.countByStatus(PostStatus.DRAFT));
        summary.put("publishedPosts", postRepository.countByStatus(PostStatus.PUBLISHED));
        summary.put("archivedPosts", postRepository.countByStatus(PostStatus.ARCHIVED));
        summary.put("totalCategories", categoryRepository.count());
        summary.put("totalUsers", userRepository.count());
        summary.put("activeUsers", userRepository.countByActiveTrue());
        return summary;
    }

    public Map<String, Long> getMonthly() {
        return postService.getMonthlyCreatedCount();
    }
}

