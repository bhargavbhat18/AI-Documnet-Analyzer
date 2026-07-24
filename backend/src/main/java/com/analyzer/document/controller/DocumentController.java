package com.analyzer.document.controller;

import com.analyzer.document.entity.DocumentMetadata;
import com.analyzer.document.service.DocumentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "${cors.allowed.origins}")
public class DocumentController {

    private static final Logger logger = LoggerFactory.getLogger(DocumentController.class);

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
        String filename = file.getOriginalFilename();
        logger.info("[CONTROLLER ENTRY] Received file upload request for file: {}", filename);
        try {
            DocumentMetadata metadata = documentService.uploadDocument(file);
            logger.info("[CONTROLLER EXIT] Successfully processed upload for: {}", filename);
            return ResponseEntity.ok(metadata);
        } catch (Exception e) {
            logger.error("[CONTROLLER ERROR] Failed to process upload for: {}. Stacktrace:", filename, e);
            
            // Build detailed error response
            String userMessage;
            String exceptionMsg = e.getMessage() != null ? e.getMessage() : "";
            
            if (e instanceof IllegalArgumentException && exceptionMsg.contains("Unsupported file type")) {
                userMessage = "Invalid file type. Supported types are PDF, DOCX, DOC, TXT.";
            } else if (e instanceof IllegalArgumentException && exceptionMsg.contains("empty")) {
                userMessage = "Upload failed: File cannot be empty.";
            } else if (exceptionMsg.contains("OpenAI") || exceptionMsg.contains("Cohere") || exceptionMsg.contains("429") || exceptionMsg.contains("Quota")) {
                userMessage = "AI Embedding failed: The cloud embedding service returned a quota limit or authentication error. Please verify keys.";
            } else if (exceptionMsg.contains("Chroma") || exceptionMsg.contains("502") || exceptionMsg.contains("Connection refused")) {
                userMessage = "ChromaDB unavailable: Cannot connect to the vector database on Render.";
            } else if (exceptionMsg.contains("SQL") || exceptionMsg.contains("Hikari") || exceptionMsg.contains("database")) {
                userMessage = "Database error: Failed to save file metadata to MySQL.";
            } else {
                userMessage = "Storage failed: " + exceptionMsg;
            }
            
            return ResponseEntity.internalServerError().body(Map.of("message", userMessage));
        }
    }

    @GetMapping
    public ResponseEntity<List<DocumentMetadata>> getAll() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/rename")
    public ResponseEntity<?> rename(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        try {
            String newName = body.get("name");
            if (newName == null || newName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Name is required");
            }
            DocumentMetadata metadata = documentService.renameDocument(id, newName);
            return ResponseEntity.ok(metadata);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> download(@PathVariable("id") Long id) {
        try {
            DocumentMetadata metadata = documentService.getDocumentById(id);
            Path filePath = Paths.get("uploads").resolve(metadata.getFilename());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(metadata.getContentType() != null ? metadata.getContentType() : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getOriginalFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/open")
    public ResponseEntity<?> open(@PathVariable("id") Long id) {
        try {
            DocumentMetadata metadata = documentService.openDocument(id);
            return ResponseEntity.ok(metadata);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
