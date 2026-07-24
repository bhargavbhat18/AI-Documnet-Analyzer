package com.analyzer.document.controller;

import com.analyzer.document.entity.UserSettings;
import com.analyzer.document.repository.UserSettingsRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "${cors.allowed.origins}")
public class SettingsController {

    private final UserSettingsRepository settingsRepository;

    public SettingsController(UserSettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    @PostConstruct
    public void initSettings() {
        if (settingsRepository.count() == 0) {
            settingsRepository.save(UserSettings.builder()
                    .name("Bhargav Bhat")
                    .email("bhargav@example.com")
                    .password("password123")
                    .theme("light")
                    .emailNotifications(true)
                    .language("English")
                    .build());
        }
    }

    @GetMapping
    public ResponseEntity<UserSettings> getSettings() {
        UserSettings settings = settingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> UserSettings.builder()
                        .name("Bhargav Bhat")
                        .email("bhargav@example.com")
                        .password("password123")
                        .theme("light")
                        .emailNotifications(true)
                        .language("English")
                        .build());
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    public ResponseEntity<UserSettings> updateSettings(@RequestBody UserSettings updated) {
        UserSettings settings = settingsRepository.findAll().stream().findFirst()
                .orElse(new UserSettings());
        
        settings.setName(updated.getName());
        settings.setEmail(updated.getEmail());
        if (updated.getPassword() != null && !updated.getPassword().trim().isEmpty()) {
            settings.setPassword(updated.getPassword());
        }
        settings.setTheme(updated.getTheme());
        settings.setEmailNotifications(updated.isEmailNotifications());
        settings.setLanguage(updated.getLanguage());
        
        return ResponseEntity.ok(settingsRepository.save(settings));
    }
}
