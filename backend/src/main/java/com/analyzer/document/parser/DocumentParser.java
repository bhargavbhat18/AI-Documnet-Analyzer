package com.analyzer.document.parser;

import com.analyzer.document.dto.DocumentChunk;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface DocumentParser {
    List<DocumentChunk> parse(MultipartFile file) throws IOException;
    boolean supports(String filename);
}
