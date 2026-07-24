package com.analyzer.document.rag;

import com.analyzer.document.dto.DocumentChunk;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
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

    public void deleteChunksByDocument(String documentName) {
        SearchRequest request = SearchRequest.query(" ")
                .withFilterExpression("documentName == '" + documentName + "'")
                .withTopK(200);
        List<Document> chunks = vectorStore.similaritySearch(request);
        if (!chunks.isEmpty()) {
            List<String> ids = chunks.stream().map(Document::getId).collect(Collectors.toList());
            vectorStore.delete(ids);
        }
    }

    public void renameDocumentChunks(String oldName, String newName) {
        SearchRequest request = SearchRequest.query(" ")
                .withFilterExpression("documentName == '" + oldName + "'")
                .withTopK(200);
        List<Document> chunks = vectorStore.similaritySearch(request);
        if (!chunks.isEmpty()) {
            List<Document> updatedChunks = chunks.stream()
                    .map(doc -> new Document(
                            doc.getId(),
                            doc.getContent(),
                            Map.of(
                                    "documentName", newName,
                                    "pageNumber", doc.getMetadata().getOrDefault("pageNumber", 1)
                            )
                    ))
                    .collect(Collectors.toList());
            vectorStore.add(updatedChunks);
        }
    }
}
