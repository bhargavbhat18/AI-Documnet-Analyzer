package com.analyzer.document.parser;

import com.analyzer.document.dto.DocumentChunk;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Parser for plain text (.txt) files.
 * Reads the entire content as UTF-8 and returns it as a single DocumentChunk.
 */
@Component
public class TxtParserImpl implements DocumentParser {

    @Override
    public boolean supports(String filename) {
        return filename != null && filename.toLowerCase().endsWith(".txt");
    }

    @Override
    public List<DocumentChunk> parse(MultipartFile file) throws IOException {
        List<DocumentChunk> chunks = new ArrayList<>();
        String filename = file.getOriginalFilename();

        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }

        String text = sb.toString().trim();
        if (!text.isEmpty()) {
            chunks.add(DocumentChunk.builder()
                    .id(UUID.randomUUID().toString())
                    .text(text)
                    .documentName(filename)
                    .pageNumber(1)
                    .build());
        }
        return chunks;
    }
}
