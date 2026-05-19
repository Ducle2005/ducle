package com.aurafitness.service;

import com.aurafitness.entity.*;
import com.aurafitness.repository.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final WeightLogRepository weightLogRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final UserRepository userRepository;

    public AnalyticsService(
            WeightLogRepository weightLogRepository, 
            WorkoutSessionRepository workoutSessionRepository,
            UserRepository userRepository) {
        this.weightLogRepository = weightLogRepository;
        this.workoutSessionRepository = workoutSessionRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> getWeightTrends(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        List<WeightLog> logs = weightLogRepository.findByUserOrderByDateAsc(user);
        Map<String, Object> trends = new HashMap<>();
        trends.put("history", logs);

        if (logs.size() >= 2) {
            Double latest = logs.get(logs.size() - 1).getWeight();
            
            // 7-day change
            LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
            logs.stream()
                .filter(l -> l.getDate().isBefore(sevenDaysAgo) || l.getDate().isEqual(sevenDaysAgo))
                .reduce((first, second) -> second)
                .ifPresent(l -> trends.put("change7d", latest - l.getWeight()));

            // 30-day change
            LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
            logs.stream()
                .filter(l -> l.getDate().isBefore(thirtyDaysAgo) || l.getDate().isEqual(thirtyDaysAgo))
                .reduce((first, second) -> second)
                .ifPresent(l -> trends.put("change30d", latest - l.getWeight()));
        }

        return trends;
    }

    public List<Map<String, Object>> getVolumeProgression(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        List<WorkoutSession> sessions = workoutSessionRepository.findByUserOrderByStartTimeDesc(user);
        List<Map<String, Object>> volumeHistory = new ArrayList<>();

        for (WorkoutSession session : sessions) {
            if ("COMPLETED".equals(session.getStatus())) {
                double totalVolume = session.getWorkoutSets().stream()
                        .mapToDouble(s -> s.getWeight() * s.getReps())
                        .sum();
                
                Map<String, Object> data = new HashMap<>();
                data.put("date", session.getStartTime().toLocalDate());
                data.put("volume", totalVolume);
                data.put("planName", session.getWorkoutPlan() != null ? session.getWorkoutPlan().getName() : "Free Workout");
                volumeHistory.add(data);
            }
        }
        
        // Reverse for chart (Ascending date)
        return volumeHistory.stream()
                .sorted((a, b) -> ((LocalDate)a.get("date")).compareTo((LocalDate)b.get("date")))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getWeeklyComparison(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        LocalDate now = LocalDate.now();
        LocalDate sevenDaysAgo = now.minusDays(7);
        LocalDate fourteenDaysAgo = now.minusDays(14);
        
        List<WorkoutSession> allSessions = workoutSessionRepository.findByUserOrderByStartTimeDesc(user);
        
        double currentWeekVolume = allSessions.stream()
                .filter(s -> "COMPLETED".equals(s.getStatus()))
                .filter(s -> !s.getStartTime().toLocalDate().isBefore(sevenDaysAgo))
                .flatMap(s -> s.getWorkoutSets().stream())
                .mapToDouble(set -> set.getWeight() * set.getReps())
                .sum();
                
        double lastWeekVolume = allSessions.stream()
                .filter(s -> "COMPLETED".equals(s.getStatus()))
                .filter(s -> s.getStartTime().toLocalDate().isBefore(sevenDaysAgo) && !s.getStartTime().toLocalDate().isBefore(fourteenDaysAgo))
                .flatMap(s -> s.getWorkoutSets().stream())
                .mapToDouble(set -> set.getWeight() * set.getReps())
                .sum();
                
        double delta = lastWeekVolume > 0 ? ((currentWeekVolume - lastWeekVolume) / lastWeekVolume) * 100 : 0;
        
        Map<String, Object> comparison = new HashMap<>();
        comparison.put("currentWeekVolume", currentWeekVolume);
        comparison.put("lastWeekVolume", lastWeekVolume);
        comparison.put("deltaPercentage", delta);
        
        return comparison;
    }

    public Map<String, String> detectStagnation(String email) {
        List<Map<String, Object>> volumeHistory = getVolumeProgression(email);
        Map<String, String> result = new HashMap<>();
        
        if (volumeHistory.size() >= 3) {
            double v1 = (double) volumeHistory.get(volumeHistory.size() - 1).get("volume");
            double v2 = (double) volumeHistory.get(volumeHistory.size() - 2).get("volume");
            double v3 = (double) volumeHistory.get(volumeHistory.size() - 3).get("volume");
            
            if (v1 <= v2 && v2 <= v3) {
                result.put("status", "STAGNANT");
                result.put("advice", "You haven't increased your volume in 3 sessions. Try a 10% weight deload or change exercises.");
            } else {
                result.put("status", "PROGRESSING");
            }
        } else {
            result.put("status", "INSUFFICIENT_DATA");
        }
        
        return result;
    }
}
