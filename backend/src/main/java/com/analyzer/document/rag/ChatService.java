package com.analyzer.document.rag;

import com.analyzer.document.entity.DocumentMetadata;
import com.analyzer.document.repository.DocumentMetadataRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

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

    public String chat(String query, String documentName) {
        SearchRequest searchRequest;
        
        if (documentName != null && !documentName.isEmpty()) {
            searchRequest = SearchRequest.query(query)
                .withFilterExpression("documentName == '" + documentName + "'")
                .withTopK(10);
        } else {
            searchRequest = SearchRequest.query(query).withTopK(10);
        }
        
        List<Document> similarDocuments = vectorStore.similaritySearch(searchRequest);

        String context = similarDocuments.stream()
                .map(Document::getContent)
                .collect(Collectors.joining("\n\n"));

        String systemPrompt = """
            You are a helpful assistant for document analysis.
            Answer the user's question using ONLY the provided context from the uploaded documents.
            If you cannot answer the question based on the context, say "I don't have enough information in the documents to answer that."
            
            Context:
            {context}
            """;
            
        return chatClient.prompt()
                .system(s -> s.text(systemPrompt).param("context", context))
                .user(query)
                .call()
                .content();
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
