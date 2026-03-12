package com.cms.services;

import com.cms.dto.PostRequest;
import com.cms.dto.PostResponse;
import com.cms.enums.PostStatus;
import com.cms.models.Category;
import com.cms.models.Post;
import com.cms.repositories.CategoryRepository;
import com.cms.repositories.PostRepository;
import com.cms.models.User;
import com.cms.exceptions.ResourceNotFoundException;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<PostResponse> getPublishedPosts(int page, int size, Long categoryId, Integer month) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findPublishedPosts(categoryId, month, pageable);
        return posts.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getDraftPosts() {
        return postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.DRAFT).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id, Optional<User> currentUser) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        if (post.getStatus() != PostStatus.PUBLISHED) {
            User user = currentUser.orElseThrow(() -> new AccessDeniedException("You do not have access to this post"));
            boolean isOwner = post.getAuthor().getId().equals(user.getId());
            boolean isManager = user.hasRole("ROLE_MANAGER");
            boolean isAdmin = user.hasRole("ROLE_ADMIN");
            if (!isOwner && !isManager && !isAdmin) {
                throw new AccessDeniedException("You do not have access to this post");
            }
        }
        return toResponse(post);
    }

    public PostResponse createPost(PostRequest request, User currentUser) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.categoryId()));

        Post post = Post.builder()
                .title(request.title())
                .body(request.body())
                .category(category)
                .author(currentUser)
                .status(resolveRequestedStatus(request.status(), currentUser))
                .build();
        return toResponse(postRepository.save(post));
    }

    public PostResponse updatePost(Long id, PostRequest request, User currentUser) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        ensureOwnerOrManagerOrAdmin(post, currentUser);

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.categoryId()));

        post.setTitle(request.title());
        post.setBody(request.body());
        post.setCategory(category);
        post.setStatus(resolveRequestedStatus(request.status(), currentUser));
        return toResponse(postRepository.save(post));
    }

    public PostResponse publishPost(Long id, boolean published, User currentUser) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        if (!currentUser.hasRole("ROLE_MANAGER") && !currentUser.hasRole("ROLE_ADMIN")) {
            throw new AccessDeniedException("You do not have permission to publish posts");
        }

        post.setStatus(published ? PostStatus.PUBLISHED : PostStatus.DRAFT);
        return toResponse(postRepository.save(post));
    }

    public void deletePost(Long id, User currentUser) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
        boolean isOwner = post.getAuthor().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.hasRole("ROLE_ADMIN");
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to delete this post");
        }
        postRepository.delete(post);
    }

    public boolean isOwner(Post post, User currentUser) {
        return post.getAuthor().getId().equals(currentUser.getId());
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getMonthlyCreatedCount() {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusMonths(11).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        return postRepository.findAllByCreatedAtBetween(start, end).stream()
                .collect(Collectors.groupingBy(post -> YearMonth.from(post.getCreatedAt()).toString(), Collectors.counting()));
    }

    private void ensureOwnerOrManagerOrAdmin(Post post, User currentUser) {
        boolean isOwner = post.getAuthor().getId().equals(currentUser.getId());
        boolean isManager = currentUser.hasRole("ROLE_MANAGER");
        boolean isAdmin = currentUser.hasRole("ROLE_ADMIN");
        if (!isOwner && !isManager && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to modify this post");
        }
    }

    private PostStatus resolveRequestedStatus(PostStatus requestedStatus, User currentUser) {
        if (!currentUser.hasRole("ROLE_MANAGER") && !currentUser.hasRole("ROLE_ADMIN")) {
            return PostStatus.DRAFT;
        }
        return requestedStatus == null ? PostStatus.DRAFT : requestedStatus;
    }

    private PostResponse toResponse(Post post) {
        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getBody(),
                post.getStatus(),
                post.getCategory().getId(),
                post.getCategory().getName(),
                post.getAuthor().getId(),
                post.getAuthor().getUsername(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}

