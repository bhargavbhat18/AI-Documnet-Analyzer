package com.analyzer.document.service;

import com.analyzer.document.dto.DocumentChunk;
import com.analyzer.document.entity.DocumentMetadata;
import com.analyzer.document.parser.DocumentParser;
import com.analyzer.document.rag.DocumentChunker;
import com.analyzer.document.rag.DocumentVectorStoreService;
import com.analyzer.document.repository.DocumentMetadataRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final List<DocumentParser> parsers;
    private final DocumentChunker chunker;
    private final DocumentVectorStoreService vectorStoreService;
    private final DocumentMetadataRepository metadataRepository;

    public DocumentService(List<DocumentParser> parsers, 
                           DocumentChunker chunker, 
                           DocumentVectorStoreService vectorStoreService,
                           DocumentMetadataRepository metadataRepository) {
        this.parsers = parsers;
        this.chunker = chunker;
        this.vectorStoreService = vectorStoreService;
        this.metadataRepository = metadataRepository;
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
        
        DocumentMetadata metadata = DocumentMetadata.builder()
                .filename(UUID.randomUUID().toString() + "_" + filename)
                .originalFilename(filename)
                .contentType(file.getContentType())
                .size(file.getSize())
                .uploadDate(LocalDateTime.now())
                .build();
                
        return metadataRepository.save(metadata);
    }
    
    public List<DocumentMetadata> getAllDocuments() {
        return metadataRepository.findAll();
    }
}
