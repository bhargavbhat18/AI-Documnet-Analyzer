package com.analyzer.document.parser;

import com.analyzer.document.dto.DocumentChunk;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Parser for legacy Microsoft Word (.doc) files using Apache POI HWPF.
 * Extracts all paragraph text and returns it as a single DocumentChunk.
 */
@Component
public class DocParserImpl implements DocumentParser {

    @Override
    public boolean supports(String filename) {
        // Matches .doc but NOT .docx (handled by DocxParserImpl)
        return filename != null
                && filename.toLowerCase().endsWith(".doc")
                && !filename.toLowerCase().endsWith(".docx");
    }

    @Override
    public List<DocumentChunk> parse(MultipartFile file) throws IOException {
        List<DocumentChunk> chunks = new ArrayList<>();
        String filename = file.getOriginalFilename();

        try (HWPFDocument document = new HWPFDocument(file.getInputStream());
             WordExtractor extractor = new WordExtractor(document)) {

            String[] paragraphs = extractor.getParagraphText();
            StringBuilder sb = new StringBuilder();
            for (String para : paragraphs) {
                if (para != null && !para.trim().isEmpty()) {
                    sb.append(para.trim()).append("\n");
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
        }
        return chunks;
    }
}
