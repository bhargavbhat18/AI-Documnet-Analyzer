package com.analyzer.document.rag;

import com.analyzer.document.dto.DocumentChunk;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DocumentVectorStoreService {

    private final VectorStore vectorStore;

    public DocumentVectorStoreService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public void addChunks(List<DocumentChunk> chunks) {
        List<Document> documents = chunks.stream()
                .map(chunk -> new Document(
                        chunk.getId(),
                        chunk.getText(),
                        Map.of(
                                "documentName", chunk.getDocumentName(),
                                "pageNumber", chunk.getPageNumber()
                        )
                ))
                .collect(Collectors.toList());
        
        vectorStore.add(documents);
    }
}
