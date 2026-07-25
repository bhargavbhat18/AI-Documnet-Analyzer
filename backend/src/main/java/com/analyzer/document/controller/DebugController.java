package com.analyzer.document.controller;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    private final VectorStore vectorStore;

    public DebugController(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    @GetMapping("/chroma")
    public ResponseEntity<?> testChroma(
            @RequestParam(value = "query", defaultValue = " ") String query,
            @RequestParam(value = "docName", required = false) String docName,
            @RequestParam(value = "topK", defaultValue = "20") int topK) {
            
        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("query", query);
        debugInfo.put("docNameFilter", docName);
        debugInfo.put("topK", topK);

        try {
            SearchRequest request;
            if (docName != null && !docName.isEmpty()) {
                request = SearchRequest.query(query)
                        .withFilterExpression("documentName == '" + docName + "'")
                        .withTopK(topK);
            } else {
                request = SearchRequest.query(query).withTopK(topK);
            }

            List<Document> results = vectorStore.similaritySearch(request);
            debugInfo.put("resultCount", results.size());

            List<Map<String, Object>> chunks = results.stream().map(doc -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", doc.getId());
                map.put("metadata", doc.getMetadata());
                map.put("contentLength", doc.getContent() != null ? doc.getContent().length() : 0);
                map.put("contentPreview", doc.getContent() != null ? 
                        doc.getContent().substring(0, Math.min(doc.getContent().length(), 150)) : "");
                return map;
            }).collect(Collectors.toList());

            debugInfo.put("chunks", chunks);
            return ResponseEntity.ok(debugInfo);

        } catch (Exception e) {
            debugInfo.put("error", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(debugInfo);
        }
    }
}
