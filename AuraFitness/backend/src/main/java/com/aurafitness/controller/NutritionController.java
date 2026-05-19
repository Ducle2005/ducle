package com.aurafitness.controller;

import com.aurafitness.entity.FoodLog;
import com.aurafitness.service.NutritionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {

    private final NutritionService nutritionService;

    public NutritionController(NutritionService nutritionService) {
        this.nutritionService = nutritionService;
    }

    @GetMapping("/daily")
    public ResponseEntity<Map<String, Object>> getDailyNutrition(
            @RequestParam(required = false) String date) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        LocalDate localDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(nutritionService.getDailyNutrition(auth.getName(), localDate));
    }

    @PostMapping("/log")
    public ResponseEntity<FoodLog> logFood(@RequestBody FoodLog log) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(nutritionService.logFood(auth.getName(), log));
    }

    @DeleteMapping("/log/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        nutritionService.deleteLog(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<Map<String, Object>>> getWeeklyNutrition() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(nutritionService.getWeeklyNutrition(auth.getName()));
    }
}
