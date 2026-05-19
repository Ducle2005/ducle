package com.aurafitness.service;

import com.aurafitness.entity.*;
import com.aurafitness.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class NutritionService {

    private final FoodLogRepository foodLogRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    public NutritionService(
            FoodLogRepository foodLogRepository,
            UserRepository userRepository,
            ProfileRepository profileRepository) {
        this.foodLogRepository = foodLogRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    public Map<String, Object> getDailyNutrition(String email, LocalDate date) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        List<FoodLog> logs = foodLogRepository.findByUserAndDate(user, date);
        Profile profile = profileRepository.findByUser(user).orElse(new Profile());

        int totalCalories = logs.stream().mapToInt(FoodLog::getCalories).sum();
        double totalProtein = logs.stream().mapToDouble(FoodLog::getProtein).sum();
        double totalCarbs = logs.stream().mapToDouble(FoodLog::getCarbs).sum();
        double totalFat = logs.stream().mapToDouble(FoodLog::getFat).sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("logs", logs);
        summary.put("totals", Map.of(
            "calories", totalCalories,
            "protein", totalProtein,
            "carbs", totalCarbs,
            "fat", totalFat
        ));
        summary.put("target", profile.getCalorieTarget());
        
        // Simple macro targets (40/30/30 split)
        if (profile.getCalorieTarget() != null) {
            summary.put("macroTargets", Map.of(
                "protein", (profile.getCalorieTarget() * 0.3) / 4,
                "carbs", (profile.getCalorieTarget() * 0.4) / 4,
                "fat", (profile.getCalorieTarget() * 0.3) / 9
            ));
        }

        return summary;
    }

    public FoodLog logFood(String email, FoodLog log) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        log.setUser(user);
        if (log.getDate() == null) log.setDate(LocalDate.now());
        return foodLogRepository.save(log);
    }

    public void deleteLog(String email, Long logId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        FoodLog log = foodLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Food log not found: " + logId));
        if (log.getUser() == null || !log.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have access to this food log");
        }
        foodLogRepository.delete(log);
    }

    public List<Map<String, Object>> getWeeklyNutrition(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Profile profile = profileRepository.findByUser(user).orElse(new Profile());

        List<Map<String, Object>> weeklyData = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            List<FoodLog> logs = foodLogRepository.findByUserAndDate(user, date);

            int totalCalories = logs.stream().mapToInt(FoodLog::getCalories).sum();
            double totalProtein = logs.stream().mapToDouble(FoodLog::getProtein).sum();
            double totalCarbs = logs.stream().mapToDouble(FoodLog::getCarbs).sum();
            double totalFat = logs.stream().mapToDouble(FoodLog::getFat).sum();

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.toString());
            dayData.put("dayLabel", date.getDayOfWeek().name().substring(0, 3));
            dayData.put("calories", totalCalories);
            dayData.put("protein", totalProtein);
            dayData.put("carbs", totalCarbs);
            dayData.put("fat", totalFat);
            dayData.put("target", profile.getCalorieTarget());
            weeklyData.add(dayData);
        }

        return weeklyData;
    }
}
