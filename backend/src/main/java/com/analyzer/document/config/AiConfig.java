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
        OpenAiApi openAiApi = new OpenAiApi(chatBaseUrl, chatApiKey);
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .withModel(chatModel)
                .build();
        return new OpenAiChatModel(openAiApi, options);
    }

    @Bean
    @Primary
    public OpenAiEmbeddingModel openAiEmbeddingModel() {
        // Cohere OpenAI-compatible endpoint — MUST use /compatibility/v1, NOT /v1
        // /v1 is Cohere's native API and is NOT compatible with OpenAI request format
        String cohereCompatibleUrl = "https://api.cohere.com/compatibility/v1";
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

