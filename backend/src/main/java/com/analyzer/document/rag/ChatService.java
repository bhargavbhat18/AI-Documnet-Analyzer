package com.analyzer.document.rag;

import com.analyzer.document.dto.ChatResponse;
import com.analyzer.document.entity.DocumentMetadata;
import com.analyzer.document.repository.DocumentMetadataRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final DocumentMetadataRepository metadataRepository;

    public ChatService(ChatClient.Builder chatClientBuilder, 
                       VectorStore vectorStore,
                       DocumentMetadataRepository metadataRepository) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
        this.metadataRepository = metadataRepository;
    }

    public ChatResponse chat(String query, String documentName) {
        SearchRequest searchRequest;
        
        if (documentName != null && !documentName.isEmpty()) {
            searchRequest = SearchRequest.query(query)
                .withFilterExpression("documentName == '" + documentName + "'")
                .withTopK(10);
        } else {
            searchRequest = SearchRequest.query(query).withTopK(10);
        }
        
        List<Document> similarDocuments = vectorStore.similaritySearch(searchRequest);
        
        System.out.println("[CHAT SERVICE] Retrieved " + similarDocuments.size() + " chunks from ChromaDB for query: " + query);
        for (int i = 0; i < similarDocuments.size(); i++) {
            Document doc = similarDocuments.get(i);
            String snippet = doc.getContent();
            if (snippet.length() > 100) {
                snippet = snippet.substring(0, 100) + "...";
            }
            System.out.println(String.format("  Chunk #%d - Metadata: %s - Content: %s", i + 1, doc.getMetadata(), snippet.replace("\n", " ")));
        }

        // Extract list of unique source document names retrieved from metadata
        List<String> sources = similarDocuments.stream()
                .map(d -> (String) d.getMetadata().getOrDefault("documentName", "Unknown"))
                .distinct()
                .collect(Collectors.toList());

        String context = similarDocuments.stream()
                .map(Document::getContent)
                .collect(Collectors.joining("\n\n"));

        String docNameHeader = (documentName != null && !documentName.isEmpty()) ? documentName : "All Uploaded Documents";

        String systemPrompt = """
            You are an AI assistant.
            Answer ONLY using the following document context.
            
            Document Name:
            {documentNameHeader}
            
            Context:
            {context}
            
            User Question:
            {query}
            
            If the answer is not found in the document, respond EXACTLY:
            "The uploaded document does not contain this information."
            Do NOT hallucinate or use any external knowledge.
            """;
            
        String responseContent = chatClient.prompt()
                .system(s -> s.text(systemPrompt)
                              .param("documentNameHeader", docNameHeader)
                              .param("context", context)
                              .param("query", query))
                .user(query)
                .call()
                .content();

        return ChatResponse.builder()
                .response(responseContent)
                .sources(sources)
                .build();
    }

    public String summarize(String documentName) {
        List<String> targetDocuments;
        
        if (documentName != null && !documentName.isEmpty()) {
            targetDocuments = List.of(documentName);
        } else {
            targetDocuments = metadataRepository.findAll().stream()
                .map(DocumentMetadata::getOriginalFilename)
                .distinct()
                .collect(Collectors.toList());
        }

        if (targetDocuments.isEmpty()) {
            return "No documents have been uploaded yet. Please upload a PDF or DOCX file first.";
        }

        StringBuilder overallSummary = new StringBuilder();

        for (String docName : targetDocuments) {
            SearchRequest searchRequest = SearchRequest.query("overview and main content of the document")
                .withFilterExpression("documentName == '" + docName + "'")
                .withTopK(20);
            
            List<Document> similarDocuments = vectorStore.similaritySearch(searchRequest);
            
            if (similarDocuments.isEmpty()) {
                continue;
            }
            
            String context = similarDocuments.stream()
                .map(Document::getContent)
                .collect(Collectors.joining("\n\n"));
                
            String systemPrompt = """
                You are a helpful assistant for document analysis.
                Provide a comprehensive and well-structured summary of the provided document: {documentName}.
                
                Document Text:
                {context}
                """;
                
            String docSummary = chatClient.prompt()
                .system(s -> s.text(systemPrompt)
                              .param("documentName", docName)
                              .param("context", context))
                .user("Please summarize the document.")
                .call()
                .content();
                
            if (overallSummary.length() > 0) {
                overallSummary.append("\n\n---\n\n");
            }
            overallSummary.append("### Summary for ").append(docName).append("\n\n").append(docSummary);
        }

        return overallSummary.toString();
    }
}
