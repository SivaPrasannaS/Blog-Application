package com.cms.repositories;

import com.cms.enums.PostStatus;
import com.cms.models.Post;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("""
            select p from Post p
            where p.status = com.cms.enums.PostStatus.PUBLISHED
              and (:categoryId is null or p.category.id = :categoryId)
              and (:month is null or function('month', p.createdAt) = :month)
            order by p.createdAt desc
            """)
    Page<Post> findPublishedPosts(@Param("categoryId") Long categoryId, @Param("month") Integer month, Pageable pageable);

    List<Post> findByStatusOrderByCreatedAtDesc(PostStatus status);

    long countByStatus(PostStatus status);

    long countByAuthorId(Long authorId);

    List<Post> findAllByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Post> findAllByOrderByCreatedAtDesc();
}

