package com.aurafitness.controller;

import com.aurafitness.entity.Achievement;
import com.aurafitness.entity.UserStats;
import com.aurafitness.service.GamificationService;
import com.aurafitness.repository.AchievementRepository;
import com.aurafitness.repository.UserRepository;
import com.aurafitness.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/gamification")
public class GamificationController {

    private final GamificationService gamificationService;
    private final AchievementRepository achievementRepository;
    private final UserRepository userRepository;

    public GamificationController(
            GamificationService gamificationService,
            AchievementRepository achievementRepository,
            UserRepository userRepository) {
        this.gamificationService = gamificationService;
        this.achievementRepository = achievementRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStats> getUserStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(gamificationService.getUserStats(auth.getName()));
    }

    @GetMapping("/achievements")
    public ResponseEntity<List<Achievement>> getAchievements() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(achievementRepository.findByUser(user));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserStats stats = gamificationService.getUserStats(auth.getName());
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        List<Achievement> achievements = achievementRepository.findByUser(user);

        Map<String, Object> summary = new HashMap<>();
        summary.put("level", stats.getLevel());
        summary.put("experience", stats.getExperience());
        summary.put("nextLevelExp", stats.getNextLevelExperience());
        summary.put("streak", stats.getCurrentStreak());
        summary.put("totalAchievements", achievements.size());
        summary.put("recentAchievements", achievements.stream().limit(3).toList());

        return ResponseEntity.ok(summary);
    }
}
