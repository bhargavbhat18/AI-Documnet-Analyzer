package com.analyzer.document.service;

import com.analyzer.document.dto.DocumentChunk;
import com.analyzer.document.entity.DocumentMetadata;
import com.analyzer.document.entity.UserNotification;
import com.analyzer.document.parser.DocumentParser;
import com.analyzer.document.rag.DocumentChunker;
import com.analyzer.document.rag.DocumentVectorStoreService;
import com.analyzer.document.repository.DocumentMetadataRepository;
import com.analyzer.document.repository.UserNotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

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
        logger.info("[UPLOAD START] Received upload request for file: {}, size: {} bytes, content type: {}", 
                filename, file.getSize(), file.getContentType());
        
        if (file.isEmpty()) {
            logger.error("[UPLOAD FAILED] File is empty: {}", filename);
            throw new IllegalArgumentException("File cannot be empty.");
        }
        
        logger.info("[UPLOAD STEP 1] Locating suitable parser for file: {}", filename);
        DocumentParser parser = parsers.stream()
                .filter(p -> p.supports(filename))
                .findFirst()
                .orElseThrow(() -> {
                    logger.error("[UPLOAD FAILED] No parser supports file type: {}", filename);
                    return new IllegalArgumentException("Unsupported file type: " + filename);
                });
                
        logger.info("[UPLOAD STEP 2] Parsing document contents into text chunks: {}", filename);
        List<DocumentChunk> rawPages = parser.parse(file);
        
        // --- VERIFY TEXT EXTRACTION ---
        long totalTextLength = rawPages.stream().mapToLong(p -> p.getText() != null ? p.getText().length() : 0).sum();
        logger.info("==================================================");
        logger.info("VERIFY TEXT EXTRACTION");
        logger.info("File name: {}", filename);
        logger.info("Extracted text length: {}", totalTextLength);
        logger.info("Page count: {}", rawPages.size());
        
        if (totalTextLength == 0) {
            logger.error("[UPLOAD FAILED] Extracted text length is 0 for file: {}", filename);
            throw new IllegalStateException("Extracted text length is 0. Parser failed to extract any characters.");
        }
        
        StringBuilder preview = new StringBuilder();
        for (DocumentChunk page : rawPages) {
            if (page.getText() != null) {
                preview.append(page.getText()).append("\n");
            }
        }
        String previewStr = preview.substring(0, Math.min(preview.length(), 1000));
        logger.info("First 1000 characters:\n{}", previewStr);
        logger.info("==================================================");
        
        logger.info("[UPLOAD STEP 3] Splitting raw text into semantic search chunks: {}", filename);
        List<DocumentChunk> chunkedPages = chunker.chunk(rawPages);
        
        // --- VERIFY CHUNKING ---
        logger.info("==================================================");
        logger.info("VERIFY CHUNKING");
        logger.info("Chunk count: {}", chunkedPages.size());
        if (!chunkedPages.isEmpty()) {
            logger.info("Chunk size (approx character count of first chunk): {}", chunkedPages.get(0).getText().length());
        }
        logger.info("Print first three chunks:");
        for (int i = 0; i < Math.min(chunkedPages.size(), 3); i++) {
            logger.info("  Chunk #{}: {}", i + 1, chunkedPages.get(i).getText());
        }
        logger.info("==================================================");
        
        logger.info("[UPLOAD STEP 4] Generating embeddings & saving chunks to ChromaDB vector store: {}", filename);
        
        // --- VERIFY VECTOR STORAGE ---
        logger.info("==================================================");
        logger.info("VERIFY VECTOR STORAGE");
        logger.info("Embedding creation request triggered for document: {}", filename);
        logger.info("Collection name: document_chunks (default)");
        logger.info("Vector count to insert: {}", chunkedPages.size());
        if (!chunkedPages.isEmpty()) {
            logger.info("Metadata format preview: documentName={}, pageNumber={}", 
                    chunkedPages.get(0).getDocumentName(), chunkedPages.get(0).getPageNumber());
        }
        logger.info("==================================================");
        
        vectorStoreService.addChunks(chunkedPages);
        logger.info("[UPLOAD STEP 4 SUCCESS] Successfully stored chunks in ChromaDB for document: {}", filename);
        
        logger.info("[UPLOAD STEP 5] Writing uploaded file to local storage directory: {}", UPLOAD_DIR);
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            logger.info("Created local uploads directory at: {}", uploadPath.toAbsolutePath());
        }
        
        String uniqueFilename = UUID.randomUUID().toString() + "_" + filename;
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        logger.info("[UPLOAD STEP 5 SUCCESS] Wrote file successfully on disk as: {}", uniqueFilename);
        
        logger.info("[UPLOAD STEP 6] Persisting document metadata to MySQL database: {}", filename);
        DocumentMetadata metadata = DocumentMetadata.builder()
                .filename(uniqueFilename)
                .originalFilename(filename)
                .contentType(file.getContentType())
                .size(file.getSize())
                .uploadDate(LocalDateTime.now())
                .lastOpened(LocalDateTime.now())
                .build();
                
        DocumentMetadata saved = metadataRepository.save(metadata);
        logger.info("[UPLOAD STEP 6 SUCCESS] Metadata saved to MySQL database with ID: {}", saved.getId());
        
        // Save notification
        notificationRepository.save(UserNotification.builder()
                .title("Upload Completed")
                .message("Document " + filename + " uploaded and indexed successfully.")
                .type("success")
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build());
                
        logger.info("[UPLOAD COMPLETE SUCCESS] Document {} processed completely and ready for search/chat.", filename);
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
