package com.cms.dto;

import com.cms.enums.PostStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PostRequest(
        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
        String title,

        @NotBlank(message = "Body is required")
        @Size(min = 20, message = "Body must be at least 20 characters")
        String body,

        @NotNull(message = "Category is required")
        Long categoryId,

        @NotNull(message = "Status is required")
        PostStatus status
) {
}

