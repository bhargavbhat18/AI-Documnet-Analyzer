package com.analyzer.document.controller;

import com.analyzer.document.entity.UserNotification;
import com.analyzer.document.repository.UserNotificationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "${cors.allowed.origins}")
public class NotificationController {

    private final UserNotificationRepository notificationRepository;

    public NotificationController(UserNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @PostConstruct
    public void initNotifications() {
        if (notificationRepository.count() == 0) {
            notificationRepository.save(UserNotification.builder()
                    .title("System Initialized")
                    .message("Welcome to DocuMind AI. Vector indexing services are active.")
                    .type("info")
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build());
        }
    }

    @GetMapping
    public ResponseEntity<List<UserNotification>> getAll() {
        return ResponseEntity.ok(notificationRepository.findAllByOrderByTimestampDesc());
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> readAll() {
        List<UserNotification> notifications = notificationRepository.findAll();
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable("id") Long id) {
        return notificationRepository.findById(id)
                .map(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                    return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        return notificationRepository.findById(id)
                .map(n -> {
                    notificationRepository.delete(n);
                    return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
