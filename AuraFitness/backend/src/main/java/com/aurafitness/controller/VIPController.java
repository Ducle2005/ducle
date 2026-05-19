package com.aurafitness.controller;

import com.aurafitness.entity.Profile;
import com.aurafitness.entity.User;
import com.aurafitness.repository.ProfileRepository;
import com.aurafitness.repository.UserRepository;
import com.aurafitness.service.VIPIntelligenceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/vip")
public class VIPController {

    private final VIPIntelligenceService vipService;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final com.aurafitness.repository.BodyScanRepository bodyScanRepository;
    private final com.aurafitness.service.FileUploadService fileUploadService;
    private final com.aurafitness.service.AICoachService aiCoachService;

    public VIPController(VIPIntelligenceService vipService, 
                         UserRepository userRepository, 
                         ProfileRepository profileRepository,
                         com.aurafitness.repository.BodyScanRepository bodyScanRepository,
                         com.aurafitness.service.FileUploadService fileUploadService,
                         com.aurafitness.service.AICoachService aiCoachService) {
        this.vipService = vipService;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.bodyScanRepository = bodyScanRepository;
        this.fileUploadService = fileUploadService;
        this.aiCoachService = aiCoachService;
    }

    @GetMapping("/insights")
    public ResponseEntity<Map<String, Object>> getVipInsights(Authentication authentication, 
                                                            @RequestParam(required = false) Integer currentBpm) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        
        if (user.getRoles() == null || !user.getRoles().contains("ROLE_PREMIUM")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This intelligence requires a VIP subscription.");
        }

        Profile profile = profileRepository.findByUser(user).orElseThrow();
        
        Map<String, Object> response = new HashMap<>();
        
        // Heart Rate
        response.put("heartRate", vipService.calculateHeartRateInsights(profile, currentBpm));
        
        // Readiness
        response.put("readiness", vipService.getReadinessAdvise(profile.getHrv()));
        
        // Progressive Overload
        response.put("progressiveOverload", vipService.getProgressiveOverloadAnalysis(user.getId()));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/body-scan")
    public ResponseEntity<com.aurafitness.entity.BodyScan> saveBodyScan(
            Authentication authentication,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam("bodyFat") Double bodyFat,
            @RequestParam("chest") Double chest,
            @RequestParam("waist") Double waist,
            @RequestParam("hips") Double hips,
            @RequestParam("weight") Double weight) {
        
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        String fileName = fileUploadService.storeFile(file);

        com.aurafitness.entity.BodyScan scan = new com.aurafitness.entity.BodyScan();
        scan.setUser(user);
        scan.setScanDate(java.time.LocalDateTime.now());
        scan.setImageUrl("/uploads/" + fileName);
        scan.setBodyFatPercentage(bodyFat);
        scan.setChest(chest);
        scan.setWaist(waist);
        scan.setHips(hips);
        scan.setWeightAtScan(weight);

        return ResponseEntity.ok(bodyScanRepository.save(scan));
    }

    @GetMapping("/body-scan/history")
    public ResponseEntity<java.util.List<com.aurafitness.entity.BodyScan>> getBodyScanHistory(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(bodyScanRepository.findByUserOrderByScanDateDesc(user));
    }

    @PostMapping("/roadmap")
    public ResponseEntity<String> generateRoadmap(@RequestBody Map<String, Object> scanData, Authentication authentication) {
        return ResponseEntity.ok(aiCoachService.getWorkoutRoadmap(authentication.getName(), scanData));
    }
}

