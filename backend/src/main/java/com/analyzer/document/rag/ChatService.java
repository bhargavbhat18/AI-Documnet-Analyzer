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
        System.out.println("==================================================");
        System.out.println("VERIFY RETRIEVAL");
        System.out.println("User question: " + query);
        System.out.println("Requested document scope filter: " + (documentName != null && !documentName.isEmpty() ? documentName : "All Documents"));
        
        SearchRequest searchRequest;
        if (documentName != null && !documentName.isEmpty()) {
            searchRequest = SearchRequest.query(query)
                .withFilterExpression("documentName == '" + documentName + "'")
                .withTopK(10);
        } else {
            searchRequest = SearchRequest.query(query).withTopK(10);
        }
        
        List<Document> similarDocuments = vectorStore.similaritySearch(searchRequest);
        
        System.out.println("Retrieved chunk count: " + similarDocuments.size());
        
        if (similarDocuments.isEmpty()) {
            String errorMsg = String.format(
                "RAG Retrieval Failed: Retrieved 0 chunks from ChromaDB for query '%s'. " +
                "Possible reasons: 1) The document '%s' was uploaded before the Cohere embeddings API base URL was fixed (please delete and re-upload it to re-index). " +
                "2) Vector storage failed during ingestion. 3) Metadata filtering failed to match the document name.",
                query, (documentName != null && !documentName.isEmpty() ? documentName : "All Documents")
            );
            System.out.println("ERROR: " + errorMsg);
            throw new IllegalStateException(errorMsg);
        }

        for (int i = 0; i < similarDocuments.size(); i++) {
                Document doc = similarDocuments.get(i);
                System.out.println(String.format("  Chunk #%d - ID: %s - Filename: %s - Content preview: %s", 
                        i + 1, 
                        doc.getId(), 
                        doc.getMetadata().getOrDefault("documentName", "Unknown"), 
                        doc.getContent().substring(0, Math.min(doc.getContent().length(), 150)).replace("\n", " ")
                ));
            }
        System.out.println("==================================================");
        
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

        // --- VERIFY PROMPT ---
        String compiledPrompt = systemPrompt
                .replace("{documentNameHeader}", docNameHeader)
                .replace("{context}", context.isEmpty() ? "[NO CONTEXT RETRIEVED - EMPTY]" : context)
                .replace("{query}", query);
        
        System.out.println("==================================================");
        System.out.println("VERIFY PROMPT");
        System.out.println("Prompt sent to LLM:\n" + compiledPrompt);
        System.out.println("==================================================");

        String responseContent = chatClient.prompt()
                .system(s -> s.text(systemPrompt)
                              .param("documentNameHeader", docNameHeader)
                              .param("context", context)
                              .param("query", query))
                .user(query)
                .call()
                .content();

        System.out.println("==================================================");
        System.out.println("LLM RESPONSE");
        System.out.println(responseContent);
        System.out.println("==================================================");

        return ChatResponse.builder()
                .response(responseContent)
                .sources(sources)
                .build();
    }

    public String summarize(String documentName) {
        SearchRequest searchRequest;
        String targetLabel;

        if (documentName != null && !documentName.isEmpty()) {
            searchRequest = SearchRequest.query("summary, overview, and main concepts of the document")
                .withFilterExpression("documentName == '" + documentName + "'")
                .withTopK(20);
            targetLabel = documentName;
        } else {
            searchRequest = SearchRequest.query("summary, overview, and main concepts of all documents")
                .withTopK(25);
            targetLabel = "all uploaded documents in the workspace";
        }

        List<Document> similarDocuments = vectorStore.similaritySearch(searchRequest);
        
        if (similarDocuments.isEmpty()) {
            return "No text context could be retrieved from the vector store to summarize " + targetLabel + ". Please ensure your files are uploaded and processed successfully.";
        }

        String context = similarDocuments.stream()
                .map(Document::getContent)
                .collect(Collectors.joining("\n\n"));

        String systemPrompt = """
            You are a helpful assistant for document analysis.
            Provide a comprehensive, well-structured, and concise summary of the provided documents: {targetLabel}.
            
            Document Text Context:
            {context}
            """;

        return chatClient.prompt()
                .system(s -> s.text(systemPrompt)
                              .param("targetLabel", targetLabel)
                              .param("context", context))
                .user("Please summarize the documents.")
                .call()
                .content();
    }
}
