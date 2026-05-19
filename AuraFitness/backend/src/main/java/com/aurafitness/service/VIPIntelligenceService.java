package com.aurafitness.service;

import com.aurafitness.entity.Profile;
import com.aurafitness.entity.WorkoutSession;
import com.aurafitness.entity.WorkoutSet;
import com.aurafitness.repository.WorkoutSessionRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VIPIntelligenceService {

    private final WorkoutSessionRepository sessionRepository;

    public VIPIntelligenceService(WorkoutSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    /**
     * Heart Rate Intelligence: Calculate HR Max and Zones
     */
    public Map<String, Object> calculateHeartRateInsights(Profile profile, Integer currentBpm) {
        Map<String, Object> insights = new HashMap<>();
        
        int age = profile.getAge() != null ? profile.getAge() : 25;
        // Formula: 220 - age
        int hrMax = 220 - age;
        
        insights.put("hrMax", hrMax);
        
        // Zones
        insights.put("fatBurnZone", Map.of("min", (int)(hrMax * 0.6), "max", (int)(hrMax * 0.7)));
        insights.put("cardioZone", Map.of("min", (int)(hrMax * 0.7), "max", (int)(hrMax * 0.8)));
        insights.put("peakZone", Map.of("min", (int)(hrMax * 0.85), "max", hrMax));

        if (currentBpm != null) {
            String zone = "Normal";
            if (currentBpm >= hrMax * 0.85) zone = "PEAK (Anaerobic)";
            else if (currentBpm >= hrMax * 0.7) zone = "CARDIO";
            else if (currentBpm >= hrMax * 0.6) zone = "FAT BURN";
            insights.put("currentZone", zone);
        }

        return insights;
    }

    /**
     * Progressive Overload Insight: Analysis volume delta
     */
    public Map<String, Object> getProgressiveOverloadAnalysis(Long userId) {
        List<WorkoutSession> lastTenStatus = sessionRepository.findTop10ByUserIdOrderByStartTimeDesc(userId);
        
        Map<String, Double> currentVolumeByMuscle = new HashMap<>();
        // Simplify: just total volume for now
        double totalVolume = lastTenStatus.size() > 0 
                ? lastTenStatus.get(0).getWorkoutSets().stream().mapToDouble(WorkoutSet::getVolume).sum()
                : 0.0;

        Map<String, Object> result = new HashMap<>();
        result.put("totalVolume", totalVolume);
        
        if (lastTenStatus.size() > 1) {
            double prevVolume = lastTenStatus.get(1).getWorkoutSets().stream()
                    .mapToDouble(WorkoutSet::getVolume)
                    .sum();
            
            double delta = totalVolume - prevVolume;
            double percentageRow = (delta / (prevVolume > 0 ? prevVolume : 1)) * 100;
            double percentage = Math.round(percentageRow * 10.0) / 10.0;
            
            result.put("deltaPercentage", percentage);
            result.put("trend", percentage > 0 ? "UP" : "DOWN");
            result.put("insight", percentage > 5 
                ? "🚀 Bùng nổ: Bạn đã tăng " + percentage + "% cường độ (Volume)! Cơ bắp đang bước vào pha siêu bù đắp." 
                : "Ổn định: Hãy thử thêm 2.5kg hoặc 2 reps vào hiệp cuối tuần sau để kích hoạt Progressive Overload.");
        }

        return result;
    }

    /**
     * HRV Readiness Analysis
     */
    public String getReadinessAdvise(Double hrv) {
        if (hrv == null || hrv == 0.0) return "Hãy đeo thiết bị đo nhịp tim vào sáng sớm để Aura phân tích độ sẵn sàng.";
        
        if (hrv >= 65.0) return "🚀 GO HARD: Chỉ số HRV của bạn rất cao (" + hrv + "ms). Cơ thể bạn đang ở trạng thái đỉnh cao. Leg Day hôm nay là ý tưởng tuyệt vời!";
        if (hrv >= 45.0) return "✅ NORMAL: HRV ổn định (" + hrv + "ms). Cơ thể đã hồi phục. Duy trì lịch tập bình thường.";
        return "⚠️ RECOVERY: Chỉ số HRV thấp (" + hrv + "ms) cho thấy bạn đang stress hoặc thiếu ngủ. Hãy tập nhẹ hoặc Yoga hôm nay.";
    }
}
