package com.aurafitness.service;

import com.aurafitness.dto.ExerciseDto;
import com.aurafitness.dto.ExercisePageResponseDto;
import com.aurafitness.entity.DifficultyLevel;
import com.aurafitness.entity.Exercise;
import com.aurafitness.entity.ExerciseEquipment;
import com.aurafitness.entity.MuscleGroup;
import com.aurafitness.repository.ExerciseRepository;
import com.aurafitness.repository.ExerciseSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExerciseCatalogService {

    private final ExerciseRepository exerciseRepository;

    public ExerciseCatalogService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional(readOnly = true)
    public ExercisePageResponseDto getExercises(String muscle, String level, String equipment, String search, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        Specification<Exercise> specification = Specification.where(
                        ExerciseSpecifications.hasMuscleGroup(parseMuscleGroup(muscle)))
                .and(ExerciseSpecifications.hasDifficulty(parseDifficultyLevel(level)))
                .and(ExerciseSpecifications.hasEquipment(parseEquipment(equipment)))
                .and(ExerciseSpecifications.matchesSearch(search));

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.ASC, "name"));
        Page<Exercise> exercisePage = exerciseRepository.findAll(specification, pageable);

        ExercisePageResponseDto response = new ExercisePageResponseDto();
        response.setContent(exercisePage.getContent().stream().map(this::toDto).collect(Collectors.toList()));
        response.setPage(exercisePage.getNumber());
        response.setSize(exercisePage.getSize());
        response.setTotalElements(exercisePage.getTotalElements());
        response.setTotalPages(exercisePage.getTotalPages());
        response.setHasNext(exercisePage.hasNext());
        response.setHasPrevious(exercisePage.hasPrevious());
        return response;
    }

    @Transactional(readOnly = true)
    public ExerciseDto getExerciseById(Long id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));
        return toDto(exercise);
    }

    @Transactional(readOnly = true)
    public List<Exercise> getExerciseEntities() {
        return exerciseRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
    }

    @Transactional
    public void seedDefaultExercises() {
        for (Exercise seedExercise : defaultExercises()) {
            Exercise exercise = exerciseRepository.findByNameIgnoreCase(seedExercise.getName()).orElseGet(Exercise::new);
            exercise.setName(seedExercise.getName());
            exercise.setMuscleGroup(seedExercise.getMuscleGroup());
            exercise.setEquipment(seedExercise.getEquipment());
            exercise.setDifficulty(seedExercise.getDifficulty());
            exercise.setDescription(seedExercise.getDescription());
            exercise.setInstructions(seedExercise.getInstructions());
            exercise.setImageUrl(seedExercise.getImageUrl());
            exercise.setVideoUrl(seedExercise.getVideoUrl());
            exerciseRepository.save(exercise);
        }
    }

    private ExerciseDto toDto(Exercise exercise) {
        ExerciseDto dto = new ExerciseDto();
        dto.setId(exercise.getId());
        dto.setName(exercise.getName());
        dto.setMuscleGroup(exercise.getMuscleGroup().name());
        dto.setEquipment(exercise.getEquipment().name());
        dto.setDifficulty(exercise.getDifficulty().name());
        dto.setDescription(exercise.getDescription());
        dto.setInstructions(Arrays.stream(exercise.getInstructions().split("\\r?\\n"))
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .collect(Collectors.toList()));
        dto.setImageUrl(exercise.getImageUrl());
        dto.setVideoUrl(exercise.getVideoUrl());
        return dto;
    }

    private MuscleGroup parseMuscleGroup(String muscle) {
        if (muscle == null || muscle.trim().isEmpty()) {
            return null;
        }
        try {
            return MuscleGroup.fromValue(muscle);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid muscle filter: " + muscle);
        }
    }

    private DifficultyLevel parseDifficultyLevel(String level) {
        if (level == null || level.trim().isEmpty()) {
            return null;
        }
        try {
            return DifficultyLevel.fromValue(level);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid level filter: " + level);
        }
    }

    private ExerciseEquipment parseEquipment(String equipment) {
        if (equipment == null || equipment.trim().isEmpty()) {
            return null;
        }
        try {
            return ExerciseEquipment.fromValue(equipment);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid equipment filter: " + equipment);
        }
    }

    private List<Exercise> defaultExercises() {
        return Arrays.asList(
                // BEGINNER (20)
                createExercise("Push-Up", MuscleGroup.CHEST, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.BEGINNER, "Fundamental push for chest and triceps.", "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=IODxDxX7oi4", "Hands slightly wider than shoulders.", "Lower until elbows at 90 degrees.", "Push back up keeping core tight."),
                createExercise("Dumbbell Row", MuscleGroup.BACK, ExerciseEquipment.DUMBBELL, DifficultyLevel.BEGINNER, "Single-arm row for mid-back and lats.", "https://images.unsplash.com/photo-1581009146145-b5ef03a24b77?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=roCP6wC66kg", "Place one hand on bench for support.", "Pull dumbbell toward your hip.", "Squeeze shoulder blade and lower slowly."),
                createExercise("Goblet Squat", MuscleGroup.LEGS, ExerciseEquipment.DUMBBELL, DifficultyLevel.BEGINNER, "Leg-building staple that improves squat form.", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=MeIiGibT6X0", "Hold dumbbell at chest with both hands.", "Descend until elbows touch knees.", "Drive through heels to stand up."),
                createExercise("Glute Bridge", MuscleGroup.GLUTES, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.BEGINNER, "Targeted glute and hamstring activation.", "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=8bbE6nqH9v8", "Lie on back with knees bent.", "Drive hips up by squeezing glutes.", "Hold at top and lower with control."),
                createExercise("Bicep Curl", MuscleGroup.ARMS, ExerciseEquipment.DUMBBELL, DifficultyLevel.BEGINNER, "Direct arm work for biceps growth.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=ykJmrZ5v0Oo", "Keep elbows tucked to your sides.", "Curl weights toward shoulders.", "Lower slowly to full extension."),
                createExercise("Calf Raise", MuscleGroup.LEGS, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.BEGINNER, "Isolated work for the gastrocnemius.", "https://images.unsplash.com/photo-1541534741688-6078c64b52d2?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=-M4-G8p8fmc", "Stand tall on a flat surface.", "Rise onto the balls of your feet.", "Pause and lower back down."),
                createExercise("Jumping Jacks", MuscleGroup.CARDIO, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.BEGINNER, "Full-body warm-up and conditioning.", "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=iSSAk4XCs5A", "Jump and spread legs while clapping.", "Return quickly to start.", "Maintain a steady rhythm."),
                createExercise("Mountain Climbers", MuscleGroup.CORE, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.BEGINNER, "High-intensity core and cardio dynamic move.", "https://images.unsplash.com/photo-1534368786749-b63e5d5f6b63?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=nmwgirgXLYM", "Start in a high plank position.", "Drive knees toward chest alternately.", "Keep hips level and core engaged."),
                createExercise("Leg Press", MuscleGroup.LEGS, ExerciseEquipment.MACHINE, DifficultyLevel.BEGINNER, "Machine-based leg drive for mass.", "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=IZxyjW7MPJQ", "Sit deep in the machine.", "Press platform away without locking knees.", "Lower slowly until knees are at 90 deg."),
                createExercise("Incline Dumbbell Press", MuscleGroup.CHEST, ExerciseEquipment.DUMBBELL, DifficultyLevel.BEGINNER, "Upper-chest focus with dumbbells.", "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=8iPEnn-ltC8", "Set bench to 45 degrees.", "Press straight up from shoulders.", "Lower with control."),
                createExercise("Lat Pulldown", MuscleGroup.BACK, ExerciseEquipment.MACHINE, DifficultyLevel.BEGINNER, "Vertical pull for back development.", "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=CAwf7n6Luuc", "Pull bar down toward upper chest.", "Don't lean too far back.", "Control the ascent."),
                createExercise("Walking Lunges", MuscleGroup.LEGS, ExerciseEquipment.DUMBBELL, DifficultyLevel.BEGINNER, "Balance and strength for legs.", "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=wrwwXE_x-pQ", "Step forward into deep lunge.", "Maintain upright torso.", "Repeat with other leg."),
                createExercise("Seated Leg Curl", MuscleGroup.LEGS, ExerciseEquipment.MACHINE, DifficultyLevel.BEGINNER, "Isolation for hamstrings.", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=1Tq3QdYUuHs", "Curl legs down.", "Squeeze at bottom.", "Full stretch at top."),
                createExercise("Dumbbell Lateral Raise", MuscleGroup.SHOULDERS, ExerciseEquipment.DUMBBELL, DifficultyLevel.BEGINNER, "Island shoulders focus.", "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=3VcKaXpzqRo", "Raise arms to shoulder level.", "Keep slight elbow bend.", "Lower slowly."),
                createExercise("Cable Triceps Pushdown", MuscleGroup.ARMS, ExerciseEquipment.CABLE, DifficultyLevel.BEGINNER, "Triceps isolation.", "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=2-LAMcpzODU", "Push down until lock out.", "Keep elbows fixed.", "Mind-muscle connection."),
                createExercise("Hammer Curl", MuscleGroup.ARMS, ExerciseEquipment.DUMBBELL, DifficultyLevel.BEGINNER, "Biceps and forearm work.", "https://images.unsplash.com/photo-1584863231364-2edc166de576?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=zC3nLlEvin4", "Neutral grip curl.", "Don't use momentum.", "Focus on brachialis."),
                createExercise("Plank", MuscleGroup.CORE, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.BEGINNER, "Core stability hold.", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=pSHjTRCQxIw", "Hold on forearms.", "Straight back.", "Engage abs."),
                createExercise("Face Pull", MuscleGroup.SHOULDERS, ExerciseEquipment.CABLE, DifficultyLevel.BEGINNER, "Rear delt and posture focus.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=eGo4IYlbE5g", "Pull rope toward face.", "Rotate elbows out.", "Squeeze back shoulders."),
                createExercise("Side Plank", MuscleGroup.CORE, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.BEGINNER, "Oblique focused static hold.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=T_SAn2u9QTM", "Hold on one forearm sideways.", "Stack feet or offset them.", "Keep hips elevated."),
                createExercise("Chest Press Machine", MuscleGroup.CHEST, ExerciseEquipment.MACHINE, DifficultyLevel.BEGINNER, "Stable chest stimulus.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=xSBA_mSInFw", "Press handles forward.", "Full range of motion.", "Don't lock elbows fully."),

                // INTERMEDIATE (20)
                createExercise("Barbell Bench Press", MuscleGroup.CHEST, ExerciseEquipment.BARBELL, DifficultyLevel.INTERMEDIATE, "Classic chest strength builder.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=rT7DgCr-3pg", "Lie flat, plant feet.", "Lower bar to mid-chest.", "Press up explosively."),
                createExercise("Romanian Deadlift", MuscleGroup.GLUTES, ExerciseEquipment.BARBELL, DifficultyLevel.INTERMEDIATE, "Hamstring and glute hinge.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=2SHsk9AzdjA", "Hinge at hips, flat back.", "Feel stretch in hamstrings.", "Snap hips forward."),
                createExercise("Barbell Back Squat", MuscleGroup.LEGS, ExerciseEquipment.BARBELL, DifficultyLevel.INTERMEDIATE, "King of all leg exercises.", "https://images.unsplash.com/photo-1534368786749-b63e5d5f6b63?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=ultWZbUMPL8", "Bar on traps, core tight.", "Squat below parallel.", "Drive up from heels."),
                createExercise("Standing Overhead Press", MuscleGroup.SHOULDERS, ExerciseEquipment.BARBELL, DifficultyLevel.INTERMEDIATE, "Primary vertical press.", "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=2yjwXTZQDDI", "Press bar straight up.", "Moving head slightly back.", "Lock out and control."),
                createExercise("Hanging Knee Raise", MuscleGroup.CORE, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.INTERMEDIATE, "Advanced core movement.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=Rd8nK4jzC1I", "Hang from bar.", "Raise knees to chest.", "Lower without swinging."),
                createExercise("Kettlebell Swing", MuscleGroup.FULL_BODY, ExerciseEquipment.KETTLEBELL, DifficultyLevel.INTERMEDIATE, "Power and conditioning hinge.", "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=YSxHifyIrvE", "Snap hips forward.", "Swing bell to chest height.", "Abs and glutes engaged."),
                createExercise("Incline Barbell Press", MuscleGroup.CHEST, ExerciseEquipment.BARBELL, DifficultyLevel.INTERMEDIATE, "Incline version for upper chest.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=SrqOu55lrYU", "Bar to upper chest.", "Press up and back.", "Maintain arch."),
                createExercise("Bent-over Barbell Row", MuscleGroup.BACK, ExerciseEquipment.BARBELL, DifficultyLevel.INTERMEDIATE, "Compound back thickness pull.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=vT2GjY_Umpw", "Pull bar to stomach.", "Back flat, knees bent.", "Squeeze lats."),
                createExercise("Conventional Deadlift", MuscleGroup.BACK, ExerciseEquipment.BARBELL, DifficultyLevel.INTERMEDIATE, "Classic power lift.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=op9kVnSso6Q", "Pull from floor.", "Engage glutes and back.", "Lock out standing tall."),
                createExercise("Front Squat", MuscleGroup.LEGS, ExerciseEquipment.BARBELL, DifficultyLevel.INTERMEDIATE, "Quad-heavy squat variant.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=Vf8_P0q2D1M", "Bar on front delts.", "Upright torso.", "Deep descent."),
                createExercise("Arnold Press", MuscleGroup.SHOULDERS, ExerciseEquipment.DUMBBELL, DifficultyLevel.INTERMEDIATE, "Full shoulder range rotation.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=6ZKnHHL_zN8", "Rotate palms out while pressing.", "Control the stretch.", "Shoulder stability."),
                createExercise("Bulgarian Split Squat", MuscleGroup.LEGS, ExerciseEquipment.DUMBBELL, DifficultyLevel.INTERMEDIATE, "Brutal single-leg work.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=2C-uNgKwPLE", "One foot on bench.", "Lunge deep on front leg.", "Focus on quads/glutes."),
                createExercise("Skull Crushers", MuscleGroup.ARMS, ExerciseEquipment.BARBELL, DifficultyLevel.INTERMEDIATE, "Direct triceps work.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=d_KZx7pKNM4", "Lower bar to forehead.", "Fixed elbows.", "Press to lock out."),
                createExercise("Russian Twist", MuscleGroup.CORE, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.INTERMEDIATE, "Dynamic oblique work.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=wkD8rjk6OGE", "Sitting, rotating torso.", "Keep feet elevated.", "Control the movement."),
                createExercise("Box Jumps", MuscleGroup.FULL_BODY, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.INTERMEDIATE, "Explosive jumping power.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=52r_Ul5k0++", "Jump onto platform.", "Soft landing.", "Step down."),
                createExercise("Cable Crossover", MuscleGroup.CHEST, ExerciseEquipment.CABLE, DifficultyLevel.INTERMEDIATE, "Chest isolation and squeeze.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=taI4XduLpTk", "Bring cables together.", "Feel chest contraction.", "Control stretch."),
                createExercise("Preacher Curl", MuscleGroup.ARMS, ExerciseEquipment.MACHINE, DifficultyLevel.INTERMEDIATE, "Stable biceps focus.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=fuK3n7AY3S4", "Arms on pad.", "Curl bar up.", "No swinging."),
                createExercise("Leg Extension", MuscleGroup.LEGS, ExerciseEquipment.MACHINE, DifficultyLevel.INTERMEDIATE, "Quad isolation mass.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=YyvSfVLYd80", "Extend legs out.", "Hold peak squeeze.", "Lower slowly."),
                createExercise("Lat Over Pullover", MuscleGroup.BACK, ExerciseEquipment.DUMBBELL, DifficultyLevel.INTERMEDIATE, "Upper back and lat expander.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=FK4rkOt_2_I", "Lower weight overhead lying.", "Pull back to chest.", "Keep elbows slightly bent."),
                createExercise("Chin Up", MuscleGroup.BACK, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.INTERMEDIATE, "Biceps-heavy vertical pull.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=mVy9onvD9v8", "Underhand grip.", "Pull chest to bar.", "Lower slowly."),

                // ADVANCED (20)
                createExercise("Pull-Up", MuscleGroup.BACK, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.ADVANCED, "Upper body pulling staple.", "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=eGo4IYlbE5g", "Chin over bar.", "Dead hang at bottom.", "Strict form."),
                createExercise("Burpee", MuscleGroup.CARDIO, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.ADVANCED, "Metabolic conditioning.", "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=TU8QYVW0gDU", "Drop to floor.", "Explosive jump up.", "Stay light on feet."),
                createExercise("Muscle-Up", MuscleGroup.FULL_BODY, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.ADVANCED, "Elite pulling and pushing move.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=gsS6N-S8S8k", "Pull to chest.", "Transition over bar.", "Push to lock out."),
                createExercise("Handstand Push-Up", MuscleGroup.SHOULDERS, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.ADVANCED, "Ultimate shoulder power.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=hGZ_S7E8y2E", "Upside down push.", "Stay balanced.", "Full lock out."),
                createExercise("Clean and Jerk", MuscleGroup.FULL_BODY, ExerciseEquipment.BARBELL, DifficultyLevel.ADVANCED, "Olympic weightlifting fundamental.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=8miqQQJEsO0", "Explosive pull to shoulders.", "Dip and drive overhead.", "Solid overhead catch."),
                createExercise("Snatch", MuscleGroup.FULL_BODY, ExerciseEquipment.BARBELL, DifficultyLevel.ADVANCED, "High-skill Olympic lifting.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=9xQp28SshS4", "Single movement pull to overhead.", "Deep overhead squat catch.", "Stabilize before standing."),
                createExercise("Pistol Squat", MuscleGroup.LEGS, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.ADVANCED, "Single leg elite balance.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=qDcniqddTeE", "Descend on one leg.", "Other leg straight forward.", "Drive back up smoothly."),
                createExercise("Dragon Flag", MuscleGroup.CORE, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.ADVANCED, "Bruce Lee's core pick.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=mjGWSB8mI_Y", "Hinge from shoulders.", "Entire body straight.", "Control descent tightly."),
                createExercise("Barbell Thruster", MuscleGroup.FULL_BODY, ExerciseEquipment.BARBELL, DifficultyLevel.ADVANCED, "Leg and shoulder burner.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=L219ltL15zk", "Deep squat into press.", "Use leg drive to push bar.", "Fluid high-rep cycle."),
                createExercise("Front Lever", MuscleGroup.BACK, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.ADVANCED, "Elite pulling static hold.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=nO3_O1V4+qI", "Horizontal body hang.", "Locked elbows.", "Full back engagement."),
                createExercise("Human Flag", MuscleGroup.FULL_BODY, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.ADVANCED, "Showcase of total body strength.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=3n_re++6uXU", "Hold sideways on bar.", "Push bottom arm/pull top.", "Body straight out."),
                createExercise("L-Sit", MuscleGroup.CORE, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.ADVANCED, "Statics for abs/shoulders.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=H6Uo4Wf1v_Q", "Hold legs out 90 degrees.", "Hanging or on floor.", "Keep hips elevated."),
                createExercise("Turkish Get-Up", MuscleGroup.FULL_BODY, ExerciseEquipment.KETTLEBELL, DifficultyLevel.ADVANCED, "Total body integration.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=0bWRPC49-KI", "Stand up from floor with bell.", "One arm overhead always.", "Step by step stability."),
                createExercise("Weighted Dip", MuscleGroup.CHEST, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.ADVANCED, "Heavy pressing for chest/arms.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=yN6Q1UI_xkE", "Dips with extra plate.", "Keep chest down for chest.", "Lower deep, explode up."),
                createExercise("Toes to Bar", MuscleGroup.CORE, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.ADVANCED, "Dynamic hanging core power.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=S0Zf7uF4B_Q", "Touch toes to bar from hang.", "Flick legs up with core.", "Control the pendulum."),
                createExercise("Archer Pull-Up", MuscleGroup.BACK, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.ADVANCED, "Unilateral pulling stimulus.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=68++Uun6f-0", "Pull to one arm.", "Other arm stays straight.", "Alternate sides."),
                createExercise("One Arm Push-Up", MuscleGroup.CHEST, ExerciseEquipment.BODYWEIGHT, DifficultyLevel.ADVANCED, "Chest power and core anti-rotation.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=pS68XitK07o", "Push with one arm.", "Feet spread wide.", "Don't let hips dip."),
                createExercise("Overhead Squat", MuscleGroup.LEGS, ExerciseEquipment.BARBELL, DifficultyLevel.ADVANCED, "Ultimate mobility and stability.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=RD_vUnKwqqI", "Squat with bar overhead.", "Wide grip, lock armpits.", "Keep bar over mid-foot."),
                createExercise("Zercher Squat", MuscleGroup.LEGS, ExerciseEquipment.BARBELL, DifficultyLevel.ADVANCED, "Brutal front-loaded squat.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=U2OKweZ-PrA", "Hold bar in elbow crooks.", "Squat while holding bar.", "Core stability is key."),
                createExercise("Strict Press (Max)", MuscleGroup.SHOULDERS, ExerciseEquipment.BARBELL, DifficultyLevel.ADVANCED, "Maximal force overhead.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80", "https://www.youtube.com/watch?v=tMAiNQJoxf0", "Overhead press for max load.", "No leg drive at all.", "Locked legs, tight glutes.")
        );
    }

    private Exercise createExercise(
            String name,
            MuscleGroup muscleGroup,
            ExerciseEquipment equipment,
            DifficultyLevel difficulty,
            String description,
            String imageUrl,
            String videoUrl,
            String... instructions) {
        return new Exercise(
                name,
                muscleGroup,
                equipment,
                difficulty,
                description,
                String.join("\n", instructions),
                imageUrl,
                videoUrl
        );
    }
}
