package com.cms.controllers;

import com.cms.dto.PostRequest;
import com.cms.dto.PostResponse;
import com.cms.services.PostService;
import com.cms.utils.SecurityUtils;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public Page<PostResponse> listPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer month
    ) {
        return postService.getPublishedPosts(page, size, categoryId, month);
    }

    @GetMapping("/drafts")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER','ROLE_ADMIN')")
    public List<PostResponse> listDraftPosts() {
        return postService.getDraftPosts();
    }

    @GetMapping("/{id:\\d+}")
    public PostResponse getPost(@PathVariable Long id) {
        return postService.getPostById(id, securityUtils.getCurrentUserOptional());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public PostResponse createPost(@Valid @RequestBody PostRequest request) {
        return postService.createPost(request, securityUtils.getCurrentUserOrThrow());
    }

    @PutMapping("/{id:\\d+}")
    @PreAuthorize("isAuthenticated()")
    public PostResponse updatePost(@PathVariable Long id, @Valid @RequestBody PostRequest request) {
        return postService.updatePost(id, request, securityUtils.getCurrentUserOrThrow());
    }

    @PatchMapping("/{id:\\d+}/publish")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER','ROLE_ADMIN')")
    public PostResponse publishPost(@PathVariable Long id, @RequestParam(defaultValue = "true") boolean published) {
        return postService.publishPost(id, published, securityUtils.getCurrentUserOrThrow());
    }

    @DeleteMapping("/{id:\\d+}")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("isAuthenticated()")
    public void deletePost(@PathVariable Long id) {
        postService.deletePost(id, securityUtils.getCurrentUserOrThrow());
    }
}

