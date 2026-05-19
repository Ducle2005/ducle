package com.aurafitness.controller;

import com.aurafitness.dto.WorkoutHistoryItemDto;
import com.aurafitness.dto.WorkoutExercisePerformanceDto;
import com.aurafitness.dto.WorkoutSessionLogRequest;
import com.aurafitness.entity.WorkoutPlan;
import com.aurafitness.entity.WorkoutSession;
import com.aurafitness.service.WorkoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @GetMapping("/plans")
    public ResponseEntity<List<WorkoutPlan>> getPlans() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(workoutService.getPlans(email));
    }

    @GetMapping("/plans/today")
    public ResponseEntity<WorkoutPlan> getTodaysWorkout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(workoutService.getTodaysWorkout(email));
    }

    @PostMapping("/plans")
    public ResponseEntity<WorkoutPlan> createPlan(@RequestBody WorkoutPlan plan) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(workoutService.createPlan(email, plan));
    }

    @PostMapping("/sessions/start")
    public ResponseEntity<WorkoutSession> startSession(@RequestParam(required = false) Long planId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(workoutService.startSession(email, planId));
    }

    @PostMapping("/sessions/{id}/complete")
    public ResponseEntity<WorkoutSession> completeSession(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(workoutService.completeSession(email, id));
    }

    @PutMapping("/sessions/{id}/sets")
    public ResponseEntity<WorkoutSession> saveSessionSets(
            @PathVariable Long id,
            @RequestBody WorkoutSessionLogRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(workoutService.saveSessionSets(email, id, request.getSets()));
    }

    @GetMapping("/sessions/history")
    public ResponseEntity<List<WorkoutHistoryItemDto>> getWorkoutHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(workoutService.getWorkoutHistory(email));
    }

    @GetMapping("/exercises/{id}/performance")
    public ResponseEntity<WorkoutExercisePerformanceDto> getExercisePerformance(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(workoutService.getExercisePerformance(email, id));
    }

    @GetMapping("/exercises")
    public ResponseEntity<List<com.aurafitness.entity.Exercise>> getExercises() {
        return ResponseEntity.ok(workoutService.getAllExercises());
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<WorkoutPlan> updatePlan(@PathVariable Long id, @RequestBody WorkoutPlan plan) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(workoutService.updatePlan(email, id, plan));
    }

    @PostMapping("/plans/{id}/duplicate")
    public ResponseEntity<WorkoutPlan> duplicatePlan(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(workoutService.duplicatePlan(email, id));
    }

    @PostMapping("/plans/{id}/archive")
    public ResponseEntity<WorkoutPlan> archivePlan(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(workoutService.archivePlan(email, id));
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        workoutService.deletePlan(email, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/exercises/seed")
    public ResponseEntity<String> seedExercises() {
        workoutService.seedExercises();
        return ResponseEntity.ok("Exercises seeded successfully");
    }
}
