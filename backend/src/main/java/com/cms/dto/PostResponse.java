package com.cms.dto;

import com.cms.enums.PostStatus;
import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        String title,
        String body,
        PostStatus status,
        Long categoryId,
        String categoryName,
        Long authorId,
        String authorUsername,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

