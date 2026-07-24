package com.analyzer.document.controller;

import com.analyzer.document.entity.UserFeedback;
import com.analyzer.document.repository.UserFeedbackRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "${cors.allowed.origins}")
public class FeedbackController {

    private final UserFeedbackRepository feedbackRepository;

    public FeedbackController(UserFeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestBody UserFeedback feedback) {
        try {
            feedback.setSubmissionDate(LocalDateTime.now());
            UserFeedback saved = feedbackRepository.save(feedback);
            return ResponseEntity.ok(Map.of(
                    "message", "Feedback received successfully. Thank you!",
                    "id", saved.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
