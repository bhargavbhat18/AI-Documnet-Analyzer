package com.analyzer.document.controller;

import com.analyzer.document.entity.DocumentTemplate;
import com.analyzer.document.repository.DocumentTemplateRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    private final DocumentTemplateRepository templateRepository;

    public TemplateController(DocumentTemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @PostConstruct
    public void initTemplates() {
        if (templateRepository.count() == 0) {
            templateRepository.save(DocumentTemplate.builder()
                    .title("Resume General Summary")
                    .category("Professional")
                    .content("Extract the candidate's professional experience, technical skills, and key achievements.")
                    .build());
            templateRepository.save(DocumentTemplate.builder()
                    .title("Project Specifications Analysis")
                    .category("Technical")
                    .content("Analyze the project scope, milestones, technical stack requirements, and deliverables.")
                    .build());
            templateRepository.save(DocumentTemplate.builder()
                    .title("Meeting Minutes Synthesizer")
                    .category("Management")
                    .content("List all action items, decisions made, key topics discussed, and attendee list from the notes.")
                    .build());
        }
    }

    @GetMapping
    public ResponseEntity<List<DocumentTemplate>> getAll(@RequestParam(value = "search", required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(templateRepository.findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(search, search));
        }
        return ResponseEntity.ok(templateRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<DocumentTemplate> create(@RequestBody DocumentTemplate template) {
        return ResponseEntity.ok(templateRepository.save(template));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentTemplate> update(@PathVariable("id") Long id, @RequestBody DocumentTemplate updated) {
        return templateRepository.findById(id)
                .map(t -> {
                    t.setTitle(updated.getTitle());
                    t.setCategory(updated.getCategory());
                    t.setContent(updated.getContent());
                    return ResponseEntity.ok(templateRepository.save(t));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        return templateRepository.findById(id)
                .map(t -> {
                    templateRepository.delete(t);
                    return ResponseEntity.ok(Map.of("message", "Template deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
