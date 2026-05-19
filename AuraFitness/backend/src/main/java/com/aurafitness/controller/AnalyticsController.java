package com.aurafitness.controller;

import com.aurafitness.entity.User;
import com.aurafitness.entity.WeightLog;
import com.aurafitness.repository.UserRepository;
import com.aurafitness.repository.WeightLogRepository;
import com.aurafitness.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;
    private final WeightLogRepository weightLogRepository;

    public AnalyticsController(
            AnalyticsService analyticsService,
            UserRepository userRepository,
            WeightLogRepository weightLogRepository) {
        this.analyticsService = analyticsService;
        this.userRepository = userRepository;
        this.weightLogRepository = weightLogRepository;
    }

    @GetMapping("/weight")
    public ResponseEntity<Map<String, Object>> getWeightTrends() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(analyticsService.getWeightTrends(auth.getName()));
    }

    @PostMapping("/weight")
    public ResponseEntity<WeightLog> logWeight(@RequestBody Map<String, Double> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Double weight = body.get("weight");
        if (weight == null || weight <= 0) {
            throw new IllegalArgumentException("Invalid weight value");
        }

        WeightLog log = new WeightLog();
        log.setUser(user);
        log.setWeight(weight);
        log.setDate(LocalDate.now());

        return ResponseEntity.ok(weightLogRepository.save(log));
    }

    @GetMapping("/volume")
    public ResponseEntity<List<Map<String, Object>>> getVolumeProgression() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(analyticsService.getVolumeProgression(auth.getName()));
    }

    @GetMapping("/stagnation")
    public ResponseEntity<Map<String, String>> detectStagnation() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(analyticsService.detectStagnation(auth.getName()));
    }

    @GetMapping("/weekly")
    public ResponseEntity<Map<String, Object>> getWeeklyComparison() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(analyticsService.getWeeklyComparison(auth.getName()));
    }
}
