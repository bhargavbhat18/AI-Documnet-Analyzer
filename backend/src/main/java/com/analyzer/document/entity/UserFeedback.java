package com.analyzer.document.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFeedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String email;
    private String category; // question, support, bug, feedback
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private LocalDateTime submissionDate;
}
