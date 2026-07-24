package com.analyzer.document.repository;

import com.analyzer.document.entity.DocumentTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentTemplateRepository extends JpaRepository<DocumentTemplate, Long> {
    List<DocumentTemplate> findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(String title, String category);
}
