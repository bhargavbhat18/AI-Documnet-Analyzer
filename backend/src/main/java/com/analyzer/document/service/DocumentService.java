package com.analyzer.document.service;

import com.analyzer.document.dto.DocumentChunk;
import com.analyzer.document.entity.DocumentMetadata;
import com.analyzer.document.entity.UserNotification;
import com.analyzer.document.parser.DocumentParser;
import com.analyzer.document.rag.DocumentChunker;
import com.analyzer.document.rag.DocumentVectorStoreService;
import com.analyzer.document.repository.DocumentMetadataRepository;
import com.analyzer.document.repository.UserNotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final List<DocumentParser> parsers;
    private final DocumentChunker chunker;
    private final DocumentVectorStoreService vectorStoreService;
    private final DocumentMetadataRepository metadataRepository;
    private final UserNotificationRepository notificationRepository;
    
    private static final String UPLOAD_DIR = "uploads";

    public DocumentService(List<DocumentParser> parsers, 
                           DocumentChunker chunker, 
                           DocumentVectorStoreService vectorStoreService,
                           DocumentMetadataRepository metadataRepository,
                           UserNotificationRepository notificationRepository) {
        this.parsers = parsers;
        this.chunker = chunker;
        this.vectorStoreService = vectorStoreService;
        this.metadataRepository = metadataRepository;
        this.notificationRepository = notificationRepository;
    }

    public DocumentMetadata uploadDocument(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        
        DocumentParser parser = parsers.stream()
                .filter(p -> p.supports(filename))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported file type: " + filename));
                
        List<DocumentChunk> rawPages = parser.parse(file);
        
        List<DocumentChunk> chunkedPages = chunker.chunk(rawPages);
        
        vectorStoreService.addChunks(chunkedPages);
        
        // Save file to disk
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        String uniqueFilename = UUID.randomUUID().toString() + "_" + filename;
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        DocumentMetadata metadata = DocumentMetadata.builder()
                .filename(uniqueFilename)
                .originalFilename(filename)
                .contentType(file.getContentType())
                .size(file.getSize())
                .uploadDate(LocalDateTime.now())
                .lastOpened(LocalDateTime.now())
                .build();
                
        DocumentMetadata saved = metadataRepository.save(metadata);
        
        // Save notification
        notificationRepository.save(UserNotification.builder()
                .title("Upload Completed")
                .message("Document " + filename + " uploaded and indexed successfully.")
                .type("success")
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build());
                
        return saved;
    }
    
    public List<DocumentMetadata> getAllDocuments() {
        return metadataRepository.findAll();
    }
    
    public DocumentMetadata getDocumentById(Long id) {
        return metadataRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with id: " + id));
    }
    
    public void deleteDocument(Long id) {
        DocumentMetadata metadata = getDocumentById(id);
        
        // Delete from disk
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(metadata.getFilename());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            e.printStackTrace();
        }
        
        // Delete from vector store
        vectorStoreService.deleteChunksByDocument(metadata.getOriginalFilename());
        
        // Delete from db
        metadataRepository.delete(metadata);
        
        notificationRepository.save(UserNotification.builder()
                .title("Document Deleted")
                .message("Document " + metadata.getOriginalFilename() + " removed successfully.")
                .type("info")
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build());
    }
    
    public DocumentMetadata renameDocument(Long id, String newName) {
        DocumentMetadata metadata = getDocumentById(id);
        String oldOriginalName = metadata.getOriginalFilename();
        
        // Maintain file extension if missing in newName
        String oldExt = "";
        int lastDotOld = oldOriginalName.lastIndexOf('.');
        if (lastDotOld != -1) {
            oldExt = oldOriginalName.substring(lastDotOld);
        }
        
        String newOriginalName = newName;
        if (!newName.endsWith(oldExt)) {
            newOriginalName = newName + oldExt;
        }
        
        // Rename on disk
        String newFilename = UUID.randomUUID().toString() + "_" + newOriginalName;
        try {
            Path oldPath = Paths.get(UPLOAD_DIR).resolve(metadata.getFilename());
            Path newPath = Paths.get(UPLOAD_DIR).resolve(newFilename);
            if (Files.exists(oldPath)) {
                Files.move(oldPath, newPath, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        
        // Update vector store
        vectorStoreService.renameDocumentChunks(oldOriginalName, newOriginalName);
        
        metadata.setOriginalFilename(newOriginalName);
        metadata.setFilename(newFilename);
        DocumentMetadata saved = metadataRepository.save(metadata);
        
        notificationRepository.save(UserNotification.builder()
                .title("Document Renamed")
                .message("Document renamed to " + newOriginalName + ".")
                .type("info")
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build());
                
        return saved;
    }
    
    public DocumentMetadata openDocument(Long id) {
        DocumentMetadata metadata = getDocumentById(id);
        metadata.setLastOpened(LocalDateTime.now());
        return metadataRepository.save(metadata);
    }
}
