package com.analyzer.document.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * Global CORS configuration applied at the servlet filter level.
 *
 * Why a CorsFilter instead of @CrossOrigin per controller:
 * - @CrossOrigin only fires after Spring MVC dispatches the request.
 * - A CorsFilter runs before all other filters, so it handles OPTIONS preflight
 *   requests and sets CORS headers before any exception or auth filter can block them.
 * - This is the most reliable CORS setup for Spring Boot REST APIs.
 *
 * Allowed origins: set CORS_ALLOWED_ORIGINS env var on Render.
 * Example: https://ai-documnet-analyzer.vercel.app,http://localhost:3000
 */
@Configuration
public class CorsConfig {

    @Value("${cors.allowed.origins:*}")
    private String allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Parse comma-separated origins from env var
        if ("*".equals(allowedOrigins.trim())) {
            config.addAllowedOriginPattern("*");
        } else {
            List<String> origins = Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
            origins.forEach(config::addAllowedOrigin);
        }

        // Allow all standard HTTP methods including OPTIONS for preflight
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");
        config.addAllowedMethod("PATCH");

        // Allow all headers (including Content-Type for multipart uploads and Authorization)
        config.addAllowedHeader("*");

        // Expose headers the frontend may need to read
        config.addExposedHeader("Content-Disposition");

        // Cache preflight for 30 minutes to reduce OPTIONS round trips
        config.setMaxAge(1800L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
