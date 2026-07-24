package com.analyzer.document.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        
        int statusCode = HttpStatus.NOT_FOUND.value();
        String errorMsg = "Endpoint not found";
        
        if (status != null) {
            try {
                statusCode = Integer.parseInt(status.toString());
                HttpStatus httpStatus = HttpStatus.valueOf(statusCode);
                errorMsg = httpStatus.getReasonPhrase();
            } catch (Exception e) {
                // ignore invalid HTTP status codes
            }
        }
        
        if (message != null && !message.toString().isEmpty()) {
            errorMsg = message.toString();
        }

        Map<String, Object> body = new HashMap<>();
        body.put("status", statusCode);
        body.put("message", errorMsg);
        body.put("timestamp", LocalDateTime.now().toString());

        return new ResponseEntity<>(body, HttpStatus.valueOf(statusCode));
    }
}
