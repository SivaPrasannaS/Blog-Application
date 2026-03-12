package com.cms.services;

import com.cms.dto.CategoryRequest;
import com.cms.models.Category;
import com.cms.repositories.CategoryRepository;
import com.cms.exceptions.ResourceNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc();
    }

    public Category create(CategoryRequest request) {
        categoryRepository.findByNameIgnoreCase(request.name()).ifPresent(category -> {
            throw new IllegalArgumentException("Category name already exists");
        });
        Category category = Category.builder()
                .name(request.name())
                .description(request.description())
                .build();
        return categoryRepository.save(category);
    }

    public Category update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        categoryRepository.findByNameIgnoreCase(request.name())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Category name already exists");
                });
        category.setName(request.name());
        category.setDescription(request.description());
        return categoryRepository.save(category);
    }

    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        categoryRepository.delete(category);
    }
}

