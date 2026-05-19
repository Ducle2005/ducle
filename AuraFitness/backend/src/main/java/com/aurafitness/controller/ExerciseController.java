package com.aurafitness.controller;

import com.aurafitness.dto.ExerciseDto;
import com.aurafitness.dto.ExercisePageResponseDto;
import com.aurafitness.service.ExerciseCatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseCatalogService exerciseCatalogService;

    public ExerciseController(ExerciseCatalogService exerciseCatalogService) {
        this.exerciseCatalogService = exerciseCatalogService;
    }

    @GetMapping
    public ResponseEntity<ExercisePageResponseDto> getExercises(
            @RequestParam(required = false) String muscle,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String equipment,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(exerciseCatalogService.getExercises(muscle, level, equipment, search, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExerciseDto> getExerciseById(@PathVariable Long id) {
        return ResponseEntity.ok(exerciseCatalogService.getExerciseById(id));
    }
}
