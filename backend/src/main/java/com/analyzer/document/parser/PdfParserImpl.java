package com.analyzer.document.parser;

import com.analyzer.document.dto.DocumentChunk;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class PdfParserImpl implements DocumentParser {

    @Override
    public boolean supports(String filename) {
        return filename != null && filename.toLowerCase().endsWith(".pdf");
    }

    @Override
    public List<DocumentChunk> parse(MultipartFile file) throws IOException {
        List<DocumentChunk> pages = new ArrayList<>();
        String filename = file.getOriginalFilename();

        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            
            for (int p = 1; p <= document.getNumberOfPages(); ++p) {
                stripper.setStartPage(p);
                stripper.setEndPage(p);
                String text = stripper.getText(document);
                
                if (text != null && !text.trim().isEmpty()) {
                    pages.add(DocumentChunk.builder()
                            .id(UUID.randomUUID().toString())
                            .text(text.trim())
                            .documentName(filename)
                            .pageNumber(p)
                            .build());
                }
            }
        }
        return pages;
    }
}
