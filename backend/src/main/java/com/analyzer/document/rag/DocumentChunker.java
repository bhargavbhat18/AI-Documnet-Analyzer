package com.analyzer.document.rag;

import com.analyzer.document.dto.DocumentChunk;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class DocumentChunker {
    
    // Configurable size for chunks and overlaps
    private static final int CHUNK_SIZE = 1000;
    private static final int OVERLAP = 200;

    public List<DocumentChunk> chunk(List<DocumentChunk> rawPages) {
        List<DocumentChunk> finalChunks = new ArrayList<>();
        
        for (DocumentChunk page : rawPages) {
            String text = page.getText();
            if (text == null || text.isEmpty()) continue;
            
            int start = 0;
            
            while (start < text.length()) {
                int idealEnd = Math.min(start + CHUNK_SIZE, text.length());
                int end = idealEnd;
                
                // If we are not at the end, try to find a natural break (space) within the backtrack limit
                if (idealEnd < text.length()) {
                    int lastSpace = text.lastIndexOf(" ", idealEnd);
                    // Only backtrack up to OVERLAP characters to find a space
                    if (lastSpace >= idealEnd - OVERLAP && lastSpace > start) {
                        end = lastSpace;
                    }
                }
                
                String chunkText = text.substring(start, end).trim();
                
                if (!chunkText.isEmpty()) {
                    finalChunks.add(DocumentChunk.builder()
                            .id(UUID.randomUUID().toString())
                            .text(chunkText)
                            .documentName(page.getDocumentName())
                            .pageNumber(page.getPageNumber())
                            .build());
                }
                
                if (end >= text.length()) {
                    break;
                }
                
                start = end - OVERLAP;
                if (start < 0) start = 0;
                
                // Prevent infinite loop if we didn't advance
                if (start >= end) {
                    start = end;
                }
            }
        }
        
        return finalChunks;
    }
}
