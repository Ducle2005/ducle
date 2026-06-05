package com.aurafitness.service;

import com.aurafitness.dto.WorkoutHistoryItemDto;
import com.aurafitness.dto.WorkoutExercisePerformanceDto;
import com.aurafitness.dto.WorkoutSetLogDto;
import com.aurafitness.entity.*;
import com.aurafitness.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class WorkoutService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;
    private final GamificationService gamificationService;
    private final ExerciseCatalogService exerciseCatalogService;

    public WorkoutService(
            WorkoutPlanRepository workoutPlanRepository,
            WorkoutSessionRepository workoutSessionRepository,
            ExerciseRepository exerciseRepository,
            UserRepository userRepository,
            GamificationService gamificationService,
            ExerciseCatalogService exerciseCatalogService) {
        this.workoutPlanRepository = workoutPlanRepository;
        this.workoutSessionRepository = workoutSessionRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
        this.gamificationService = gamificationService;
        this.exerciseCatalogService = exerciseCatalogService;
    }

    @Transactional
    public WorkoutPlan createPlan(String email, WorkoutPlan plan) {
        User user = getUserByEmail(email);
        plan.setUser(user);
        plan.setArchived(Boolean.FALSE);
        for (WorkoutExercise we : plan.getWorkoutExercises()) {
            we.setWorkoutPlan(plan);
            if (we.getExercise() == null || we.getExercise().getId() == null) {
                throw new IllegalArgumentException("Each workout exercise must reference an existing exercise id");
            }
            Exercise exercise = exerciseRepository.findById(we.getExercise().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Exercise not found: " + we.getExercise().getId()));
            we.setExercise(exercise);
        }
        return workoutPlanRepository.save(plan);
    }

    @Transactional
    public WorkoutPlan updatePlan(String email, Long planId, WorkoutPlan updatedPlan) {
        User user = getUserByEmail(email);
        WorkoutPlan existing = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found: " + planId));
        if (existing.getUser() == null || !existing.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have access to this workout plan");
        }

        existing.setName(updatedPlan.getName());
        existing.setDescription(updatedPlan.getDescription());
        existing.setScheduledDay(updatedPlan.getScheduledDay());
        existing.setGoal(updatedPlan.getGoal());
        existing.setProgramWeek(updatedPlan.getProgramWeek());

        // Update exercises
        existing.getWorkoutExercises().clear();
        if (updatedPlan.getWorkoutExercises() != null) {
            for (WorkoutExercise we : updatedPlan.getWorkoutExercises()) {
                we.setWorkoutPlan(existing);
                if (we.getExercise() != null && we.getExercise().getId() != null) {
                    Exercise exercise = exerciseRepository.findById(we.getExercise().getId())
                            .orElseThrow(() -> new IllegalArgumentException("Exercise not found: " + we.getExercise().getId()));
                    we.setExercise(exercise);
                }
                existing.getWorkoutExercises().add(we);
            }
        }

        return workoutPlanRepository.save(existing);
    }

    @Transactional
    public void deletePlan(String email, Long planId) {
        User user = getUserByEmail(email);
        WorkoutPlan plan = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found: " + planId));
        if (plan.getUser() == null || !plan.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have access to this workout plan");
        }

        // Unlink from workout sessions to avoid foreign key constraint violations
        List<WorkoutSession> sessions = workoutSessionRepository.findByUserOrderByStartTimeDesc(user);
        for (WorkoutSession session : sessions) {
            if (session.getWorkoutPlan() != null && session.getWorkoutPlan().getId().equals(planId)) {
                session.setWorkoutPlan(null);
                for (WorkoutSet set : session.getWorkoutSets()) {
                    if (set.getWorkoutExercise() != null && set.getWorkoutExercise().getWorkoutPlan() != null && set.getWorkoutExercise().getWorkoutPlan().getId().equals(planId)) {
                        set.setWorkoutExercise(null);
                    }
                }
                workoutSessionRepository.save(session);
            }
        }

        workoutPlanRepository.delete(plan);
    }

    @Transactional
    public WorkoutPlan archivePlan(String email, Long planId) {
        User user = getUserByEmail(email);
        WorkoutPlan plan = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found: " + planId));
        if (plan.getUser() == null || !plan.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have access to this workout plan");
        }
        plan.setArchived(true);
        return workoutPlanRepository.save(plan);
    }

    @Transactional
    public WorkoutPlan duplicatePlan(String email, Long planId) {
        User user = getUserByEmail(email);
        WorkoutPlan source = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found: " + planId));
        if (source.getUser() == null || !source.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have access to this workout plan");
        }

        WorkoutPlan copy = new WorkoutPlan();
        copy.setUser(user);
        copy.setName(source.getName() + " (Copy)");
        copy.setDescription(source.getDescription());
        copy.setScheduledDay(source.getScheduledDay());
        copy.setGoal(source.getGoal());
        copy.setProgramWeek(source.getProgramWeek());
        copy.setArchived(false);

        for (WorkoutExercise sourceExercise : source.getWorkoutExercises()) {
            WorkoutExercise next = new WorkoutExercise();
            next.setWorkoutPlan(copy);
            next.setExercise(sourceExercise.getExercise());
            next.setTargetSets(sourceExercise.getTargetSets());
            next.setTargetReps(sourceExercise.getTargetReps());
            next.setTargetWeight(sourceExercise.getTargetWeight());
            next.setRestSeconds(sourceExercise.getRestSeconds());
            next.setTempo(sourceExercise.getTempo());
            next.setSupersetGroup(sourceExercise.getSupersetGroup());
            next.setNotes(sourceExercise.getNotes());
            next.setSortOrder(sourceExercise.getSortOrder());
            copy.getWorkoutExercises().add(next);
        }

        return workoutPlanRepository.save(copy);
    }

    public WorkoutPlan getTodaysWorkout(String email) {
        User user = getUserByEmail(email);
        
        String today = java.time.LocalDate.now().getDayOfWeek().name(); // e.g. "MONDAY"
        List<WorkoutPlan> plans = workoutPlanRepository.findByUser(user);
        
        return plans.stream()
                .filter(p -> today.equalsIgnoreCase(p.getScheduledDay()))
                .findFirst()
                .orElse(null);
    }

    public List<WorkoutPlan> getPlans(String email) {
        User user = getUserByEmail(email);
        return workoutPlanRepository.findByUser(user)
                .stream()
                .filter(plan -> !Boolean.TRUE.equals(plan.getArchived()))
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkoutSession startSession(String email, Long planId) {
        User user = getUserByEmail(email);

        WorkoutPlan plan = null;
        if (planId != null) {
            plan = workoutPlanRepository.findById(planId)
                    .orElseThrow(() -> new RuntimeException("Workout plan not found: " + planId));
            if (plan.getUser() == null || !plan.getUser().getId().equals(user.getId())) {
                throw new AccessDeniedException("You do not have access to this workout plan");
            }
        }

        WorkoutSession session = new WorkoutSession();
        session.setUser(user);
        session.setWorkoutPlan(plan);
        session.setStartTime(LocalDateTime.now());
        session.setStatus("IN_PROGRESS");

        return workoutSessionRepository.save(session);
    }

    @Transactional
    public WorkoutSession saveSessionSets(String email, Long sessionId, List<WorkoutSetLogDto> setLogs) {
        WorkoutSession session = getAccessibleSession(email, sessionId);
        if ("COMPLETED".equalsIgnoreCase(session.getStatus())) {
            throw new IllegalStateException("Cannot update a completed workout session");
        }

        List<WorkoutSetLogDto> safeSetLogs = setLogs != null ? setLogs : new ArrayList<>();
        session.getWorkoutSets().clear();

        if (safeSetLogs.isEmpty()) {
            return workoutSessionRepository.save(session);
        }

        if (session.getWorkoutPlan() == null) {
            throw new IllegalArgumentException("Free workout logging is not supported yet");
        }

        Map<Long, WorkoutExercise> workoutExerciseMap = session.getWorkoutPlan().getWorkoutExercises().stream()
                .collect(Collectors.toMap(WorkoutExercise::getId, Function.identity()));

        for (WorkoutSetLogDto setLog : safeSetLogs) {
            if (setLog.getWorkoutExerciseId() == null) {
                throw new IllegalArgumentException("Workout exercise id is required for each set");
            }

            WorkoutExercise workoutExercise = workoutExerciseMap.get(setLog.getWorkoutExerciseId());
            if (workoutExercise == null) {
                throw new AccessDeniedException("You do not have access to this workout exercise");
            }

            WorkoutSet workoutSet = new WorkoutSet();
            workoutSet.setWorkoutSession(session);
            workoutSet.setWorkoutExercise(workoutExercise);
            workoutSet.setSetNumber(setLog.getSetNumber());
            workoutSet.setWeight(setLog.getWeight());
            workoutSet.setReps(setLog.getReps());
            workoutSet.setSetType(setLog.getSetType());
            workoutSet.setRpe(setLog.getRpe());
            workoutSet.setRir(setLog.getRir());
            workoutSet.setRestSeconds(setLog.getRestSeconds());
            workoutSet.setTempo(setLog.getTempo());
            workoutSet.setSupersetGroup(setLog.getSupersetGroup());
            workoutSet.setNotes(setLog.getNotes());
            workoutSet.setCompleted(Boolean.TRUE.equals(setLog.getCompleted()));
            session.getWorkoutSets().add(workoutSet);
        }

        return workoutSessionRepository.save(session);
    }

    @Transactional
    public WorkoutSession completeSession(String email, Long sessionId) {
        WorkoutSession session = getAccessibleSession(email, sessionId);
        session.setEndTime(LocalDateTime.now());
        session.setStatus("COMPLETED");
        
        // Gamification: Reward XP and update streak
        gamificationService.rewardWorkoutCompletion(session.getUser());
        
        return workoutSessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public List<WorkoutHistoryItemDto> getWorkoutHistory(String email) {
        User user = getUserByEmail(email);
        return workoutSessionRepository.findByUserOrderByStartTimeDesc(user).stream()
                .map(this::toHistoryItem)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkoutExercisePerformanceDto getExercisePerformance(String email, Long exerciseId) {
        User user = getUserByEmail(email);
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found: " + exerciseId));

        List<WorkoutExercisePerformanceDto.SetSnapshot> snapshots = new ArrayList<>();
        for (WorkoutSession session : workoutSessionRepository.findByUserOrderByStartTimeDesc(user)) {
            for (WorkoutSet set : session.getWorkoutSets()) {
                if (!Boolean.TRUE.equals(set.getCompleted()) || set.getWorkoutExercise() == null) {
                    continue;
                }
                Exercise setExercise = set.getWorkoutExercise().getExercise();
                if (setExercise == null || !exerciseId.equals(setExercise.getId())) {
                    continue;
                }

                WorkoutExercisePerformanceDto.SetSnapshot snapshot = new WorkoutExercisePerformanceDto.SetSnapshot();
                snapshot.setStartTime(session.getStartTime());
                snapshot.setPlanName(session.getWorkoutPlan() != null ? session.getWorkoutPlan().getName() : "Free Workout");
                snapshot.setSetNumber(set.getSetNumber());
                snapshot.setWeight(set.getWeight());
                snapshot.setReps(set.getReps());
                snapshot.setSetType(set.getSetType());
                snapshot.setRpe(set.getRpe());
                snapshot.setRir(set.getRir());
                snapshot.setNotes(set.getNotes());
                snapshot.setVolume(set.getVolume());
                snapshot.setOneRepMax(set.getPredictedOneRepMax());
                snapshots.add(snapshot);
            }
        }

        WorkoutExercisePerformanceDto dto = new WorkoutExercisePerformanceDto();
        dto.setExerciseId(exerciseId);
        dto.setExerciseName(exercise.getName());
        dto.setRecentSets(snapshots.stream().limit(12).collect(Collectors.toList()));

        for (WorkoutExercisePerformanceDto.SetSnapshot snapshot : snapshots) {
            if (snapshot.getWeight() != null && snapshot.getWeight() > dto.getBestWeight()) {
                dto.setBestWeight(snapshot.getWeight());
                dto.setBestReps(snapshot.getReps() != null ? snapshot.getReps() : 0);
            }
            if (snapshot.getOneRepMax() > dto.getBestOneRepMax()) {
                dto.setBestOneRepMax(snapshot.getOneRepMax());
            }
            if (snapshot.getVolume() > dto.getBestVolume()) {
                dto.setBestVolume(snapshot.getVolume());
            }
        }

        double latestVolume = snapshots.stream().limit(4).mapToDouble(WorkoutExercisePerformanceDto.SetSnapshot::getVolume).sum();
        double previousVolume = snapshots.stream().skip(4).limit(4).mapToDouble(WorkoutExercisePerformanceDto.SetSnapshot::getVolume).sum();
        if (snapshots.size() < 4) {
            dto.setTrend("INSUFFICIENT_DATA");
            dto.setRecommendation("Ghi log thêm vài buổi để hệ thống gợi ý tăng tải chính xác hơn.");
        } else if (latestVolume > previousVolume * 1.05) {
            dto.setTrend("PROGRESSING");
            dto.setRecommendation("Hiệu suất đang tăng. Nếu form vẫn tốt, hãy tăng 2.5kg hoặc thêm 1-2 reps ở buổi sau.");
        } else if (latestVolume < previousVolume * 0.9) {
            dto.setTrend("DROPPING");
            dto.setRecommendation("Volume đang giảm. Nên giữ tạ, tăng nghỉ giữa hiệp và kiểm tra phục hồi.");
        } else {
            dto.setTrend("PLATEAU");
            dto.setRecommendation("Đang chững lại. Thử đổi rep range, thêm deload nhẹ hoặc tăng tạ nhỏ hơn.");
        }

        return dto;
    }

    public List<Exercise> getAllExercises() {
        return exerciseCatalogService.getExerciseEntities();
    }

    @Transactional
    public void seedExercises() {
        exerciseCatalogService.seedDefaultExercises();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private WorkoutSession getAccessibleSession(String email, Long sessionId) {
        WorkoutSession session = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        if (session.getUser() == null || !email.equalsIgnoreCase(session.getUser().getEmail())) {
            throw new AccessDeniedException("You do not have access to this workout session");
        }
        return session;
    }

    private WorkoutHistoryItemDto toHistoryItem(WorkoutSession session) {
        WorkoutHistoryItemDto dto = new WorkoutHistoryItemDto();
        dto.setSessionId(session.getId());
        dto.setPlanName(session.getWorkoutPlan() != null ? session.getWorkoutPlan().getName() : "Free Workout");
        dto.setScheduledDay(session.getWorkoutPlan() != null ? session.getWorkoutPlan().getScheduledDay() : null);
        dto.setStartTime(session.getStartTime());
        dto.setEndTime(session.getEndTime());
        dto.setStatus(session.getStatus());

        if (session.getStartTime() != null && session.getEndTime() != null) {
            dto.setDurationMinutes(Duration.between(session.getStartTime(), session.getEndTime()).toMinutes());
        }

        int completedSets = 0;
        double totalVolume = 0;
        LinkedHashSet<Long> uniqueExercises = new LinkedHashSet<>();

        for (WorkoutSet workoutSet : session.getWorkoutSets()) {
            if (Boolean.TRUE.equals(workoutSet.getCompleted())) {
                completedSets++;
                double weight = workoutSet.getWeight() != null ? workoutSet.getWeight() : 0;
                int reps = workoutSet.getReps() != null ? workoutSet.getReps() : 0;
                totalVolume += weight * reps;
            }
            if (workoutSet.getWorkoutExercise() != null && workoutSet.getWorkoutExercise().getId() != null) {
                uniqueExercises.add(workoutSet.getWorkoutExercise().getId());
            }
        }

        if (uniqueExercises.isEmpty() && session.getWorkoutPlan() != null) {
            uniqueExercises.addAll(session.getWorkoutPlan().getWorkoutExercises().stream()
                    .map(WorkoutExercise::getId)
                    .collect(Collectors.toList()));
        }

        dto.setCompletedSets(completedSets);
        dto.setExerciseCount(uniqueExercises.size());
        dto.setTotalVolume(totalVolume);
        return dto;
    }
}
