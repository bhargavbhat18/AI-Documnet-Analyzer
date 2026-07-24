package com.analyzer.document.controller;

import com.analyzer.document.entity.DocumentMetadata;
import com.analyzer.document.repository.DocumentMetadataRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "${cors.allowed.origins}")
public class AnalyticsController {

    private final DocumentMetadataRepository metadataRepository;

    public AnalyticsController(DocumentMetadataRepository metadataRepository) {
        this.metadataRepository = metadataRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAnalytics() {
        List<DocumentMetadata> docs = metadataRepository.findAll();
        
        long totalDocs = docs.size();
        long totalStorage = docs.stream().mapToLong(d -> d.getSize() != null ? d.getSize() : 0).sum();
        
        // Group uploads by date (format: "yyyy-MM-dd")
        Map<String, Long> uploadTrends = new TreeMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        docs.forEach(d -> {
            if (d.getUploadDate() != null) {
                String dateStr = d.getUploadDate().format(formatter);
                uploadTrends.put(dateStr, uploadTrends.getOrDefault(dateStr, 0L) + 1);
            }
        });
        
        // Most analyzed documents (sorted by lastOpened DESC)
        List<Map<String, Object>> mostAnalyzed = docs.stream()
                .filter(d -> d.getLastOpened() != null)
                .sorted(Comparator.comparing(DocumentMetadata::getLastOpened).reversed())
                .limit(5)
                .map(d -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", d.getId());
                    map.put("name", d.getOriginalFilename());
                    map.put("lastOpened", d.getLastOpened());
                    map.put("size", d.getSize());
                    return map;
                })
                .collect(Collectors.toList());
                
        // Distribution of document formats
        Map<String, Long> formatDistribution = new HashMap<>();
        docs.forEach(d -> {
            String name = d.getOriginalFilename();
            int dot = name.lastIndexOf('.');
            String ext = dot != -1 ? name.substring(dot + 1).toUpperCase() : "UNKNOWN";
            formatDistribution.put(ext, formatDistribution.getOrDefault(ext, 0L) + 1);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("totalDocuments", totalDocs);
        response.put("totalStorageBytes", totalStorage);
        response.put("uploadTrends", uploadTrends);
        response.put("mostAnalyzed", mostAnalyzed);
        response.put("formats", formatDistribution);
        response.put("aiQueriesCount", totalDocs * 4); // mock calculation based on documents count
        
        return ResponseEntity.ok(response);
    }
}
