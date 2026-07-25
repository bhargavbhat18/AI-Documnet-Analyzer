package com.analyzer.document.config;

import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.openai.OpenAiEmbeddingOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class AiConfig {

    // ─── Gemini Chat (via OpenAI-compatible endpoint) ───────────────────────────
    @Value("${spring.ai.openai.api-key}")
    private String chatApiKey;

    @Value("${spring.ai.openai.base-url:https://generativelanguage.googleapis.com/v1beta/openai}")
    private String chatBaseUrl;

    @Value("${spring.ai.openai.chat.options.model:gemini-1.5-flash}")
    private String chatModel;

    // ─── Cohere Embeddings (via OpenAI-compatible endpoint) ─────────────────────
    @Value("${spring.ai.cohere.api-key:}")
    private String cohereApiKey;

    @Value("${spring.ai.cohere.embedding.options.model:embed-english-v3.0}")
    private String embeddingModel;

    @Bean
    @Primary
    public OpenAiChatModel openAiChatModel() {
        // Override the default completionsPath "/v1/chat/completions" to "/chat/completions" for Gemini OpenAI compatibility
        org.springframework.web.client.RestClient.Builder restClientBuilder = org.springframework.web.client.RestClient.builder();
        org.springframework.web.reactive.function.client.WebClient.Builder webClientBuilder = org.springframework.web.reactive.function.client.WebClient.builder();
        
        OpenAiApi openAiApi = new OpenAiApi(
                chatBaseUrl,
                chatApiKey,
                "/chat/completions",
                "/embeddings",
                restClientBuilder,
                webClientBuilder,
                new org.springframework.web.client.DefaultResponseErrorHandler()
        );
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .withModel(chatModel)
                .build();
        return new OpenAiChatModel(openAiApi, options);
    }

    @Bean
    @Primary
    public OpenAiEmbeddingModel openAiEmbeddingModel() {
        // Cohere OpenAI-compatible base URL. Spring AI internally appends "/v1/embeddings",
        // so setting the base to "https://api.cohere.com/compatibility" results in:
        // "https://api.cohere.com/compatibility/v1/embeddings"
        String cohereCompatibleUrl = "https://api.cohere.com/compatibility";
        OpenAiApi openAiApi = new OpenAiApi(cohereCompatibleUrl, cohereApiKey);

        OpenAiEmbeddingOptions options = OpenAiEmbeddingOptions.builder()
                .withModel(embeddingModel)
                .build();

        return new OpenAiEmbeddingModel(
                openAiApi,
                org.springframework.ai.document.MetadataMode.ALL,
                options
        );
    }
}

