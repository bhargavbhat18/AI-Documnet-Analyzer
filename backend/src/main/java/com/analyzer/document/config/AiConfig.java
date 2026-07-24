package com.analyzer.document.config;

import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.openai.OpenAiEmbeddingOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.retry.support.RetryTemplate;

@Configuration
public class AiConfig {

    @Value("${spring.ai.openai.api-key}")
    private String chatApiKey;

    @Value("${spring.ai.openai.base-url:https://generativelanguage.googleapis.com/v1beta/openai}")
    private String chatBaseUrl;

    @Value("${spring.ai.openai.chat.options.model:gemini-1.5-flash}")
    private String chatModel;

    @Value("${spring.ai.cohere.api-key:}")
    private String cohereApiKey;

    @Bean
    @Primary
    public OpenAiChatModel openAiChatModel() {
        OpenAiApi openAiApi = new OpenAiApi(chatBaseUrl, chatApiKey);
        return new OpenAiChatModel(openAiApi);
    }

    @Bean
    @Primary
    public OpenAiEmbeddingModel openAiEmbeddingModel() {
        // Connect to Cohere's OpenAI-compatible embeddings endpoint
        String embeddingBaseUrl = "https://api.cohere.com/v1";
        OpenAiApi openAiApi = new OpenAiApi(embeddingBaseUrl, cohereApiKey);
        
        OpenAiEmbeddingOptions options = OpenAiEmbeddingOptions.builder()
                .withModel("embed-english-v3.0")
                .build();
                
        return new OpenAiEmbeddingModel(openAiApi, org.springframework.ai.document.MetadataMode.ALL, options);
    }
}
