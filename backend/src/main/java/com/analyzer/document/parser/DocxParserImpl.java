package com.analyzer.document.parser;

import com.analyzer.document.dto.DocumentChunk;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class DocxParserImpl implements DocumentParser {

    @Override
    public boolean supports(String filename) {
        return filename != null && filename.toLowerCase().endsWith(".docx");
    }

    @Override
    public List<DocumentChunk> parse(MultipartFile file) throws IOException {
        List<DocumentChunk> chunks = new ArrayList<>();
        String filename = file.getOriginalFilename();
        
        try (XWPFDocument document = new XWPFDocument(file.getInputStream())) {
            StringBuilder sb = new StringBuilder();
            
            for (XWPFParagraph p : document.getParagraphs()) {
                sb.append(p.getText()).append("\n");
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
