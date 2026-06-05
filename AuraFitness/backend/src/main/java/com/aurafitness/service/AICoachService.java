package com.aurafitness.service;

import com.aurafitness.entity.*;
import com.aurafitness.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AICoachService {

    private final AnalyticsService analyticsService;
    private final NutritionService nutritionService;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    public AICoachService(
            AnalyticsService analyticsService,
            NutritionService nutritionService,
            WorkoutSessionRepository workoutSessionRepository,
            UserRepository userRepository,
            ProfileRepository profileRepository) {
        this.analyticsService = analyticsService;
        this.nutritionService = nutritionService;
        this.workoutSessionRepository = workoutSessionRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    @SuppressWarnings("unchecked")
    public List<String> getActionableAdvice(String email) {
        List<String> advice = new ArrayList<>();
        User user = userRepository.findByEmail(email).orElseThrow();

        // â”€â”€ 1. Nutrition Analysis (Today) â”€â”€
        try {
            Map<String, Object> nutrition = nutritionService.getDailyNutrition(email, LocalDate.now());
            Map<String, Object> totals = (Map<String, Object>) nutrition.get("totals");
            Integer targetCals = (Integer) nutrition.get("target");
            Map<String, Object> macroTargets = (Map<String, Object>) nutrition.get("macroTargets");

            if (totals != null && targetCals != null) {
                int currentCals = ((Number) totals.get("calories")).intValue();
                
                if (currentCals == 0) {
                    advice.add("🍽️ Bạn chưa ghi nhận bữa ăn nào hôm nay. Đừng bỏ bữa — năng lượng là nền tảng cho buổi tập hiệu quả.");
                } else if (currentCals < targetCals * 0.5) {
                    advice.add("⚠️ Bạn mới nạp " + currentCals + " kcal, chỉ bằng " + Math.round(currentCals * 100.0 / targetCals) + "% mục tiêu. Hãy bổ sung thêm để hỗ trợ phục hồi cơ bắp.");
                } else if (currentCals < targetCals * 0.7) {
                    advice.add("🔋 Năng lượng đang thấp hơn mục tiêu. Hãy thêm một bữa phụ giàu protein để bù đắp.");
                } else if (currentCals > targetCals * 1.2) {
                    advice.add("📊 Bạn đã vượt mục tiêu calo hôm nay. Nếu đang trong giai đoạn Cut thì cần chú ý hơn.");
                }

                if (macroTargets != null) {
                    double currentProtein = ((Number) totals.get("protein")).doubleValue();
                    double targetProtein = ((Number) macroTargets.get("protein")).doubleValue();
                    if (currentProtein < targetProtein * 0.5 && currentCals > 0) {
                        advice.add("🥩 Cảnh báo Protein! Bạn mới nạp " + Math.round(currentProtein) + "g/" + Math.round(targetProtein) + "g. Hãy bổ sung ngay nguồn đạm chất lượng.");
                    }
                }
            }
        } catch (Exception ignored) {
            // Nutrition data may not be available
        }

        // â”€â”€ 2. Training Volume Progression â”€â”€
        try {
            Map<String, Object> comparison = analyticsService.getWeeklyComparison(email);
            if (comparison != null) {
                double delta = ((Number) comparison.get("deltaPercentage")).doubleValue();
                double currentVol = ((Number) comparison.get("currentWeekVolume")).doubleValue();
                
                if (delta < -20) {
                    advice.add("📉 Khối lượng tập tuần này giảm " + Math.abs(Math.round(delta)) + "%. Nếu không phải deload thì hãy ưu tiên phục hồi.");
                } else if (delta > 15) {
                    advice.add("🔥 Tuần này bạn tăng " + Math.round(delta) + "% khối lượng tập. Hãy lắng nghe cơ thể để tránh overtraining.");
                } else if (currentVol == 0) {
                    advice.add("💪 Tuần này chưa có buổi tập nào hoàn thành. Hãy bắt đầu từ một buổi nhẹ để giữ nhịp.");
                }
            }
        } catch (Exception ignored) {}

        // â”€â”€ 3. Progressive Overload Suggestion â”€â”€
        try {
            List<WorkoutSession> sessions = workoutSessionRepository.findByUserOrderByStartTimeDesc(user);
            if (!sessions.isEmpty()) {
                WorkoutSession last = sessions.get(0);
                last.getWorkoutSets().stream()
                    .filter(s -> s.getReps() != null && s.getReps() >= 12 && s.getCompleted() != null && s.getCompleted())
                    .findFirst()
                    .ifPresent(set -> {
                        String exerciseName = set.getWorkoutExercise() != null ?
                            set.getWorkoutExercise().getExercise().getName() : "bài tập chính";
                        double currentWeight = set.getWeight() != null ? set.getWeight() : 0;
                        advice.add("⚖️ Progressive Overload: Bạn đã hoàn thành 12 reps " + exerciseName 
                            + (currentWeight > 0 ? " ở " + currentWeight + "kg" : "") 
                            + ". Thử tăng 2.5kg ở buổi tập tiếp theo!");
                    });
            }
        } catch (Exception ignored) {}

        // â”€â”€ 4. Time-based Recovery Tips â”€â”€
        LocalTime now = LocalTime.now();
        if (now.isAfter(LocalTime.of(21, 0))) {
            advice.add("😴 Đã muộn rồi! Giấc ngủ 7-9 tiếng là yếu tố then chốt cho phục hồi cơ bắp. Hãy nghỉ ngơi sớm.");
        } else if (now.isBefore(LocalTime.of(8, 0))) {
            advice.add("🌅 Buổi sáng là thời điểm lý tưởng để nạp protein và hydrate. Hãy bắt đầu ngày mới tràn đầy năng lượng.");
        }

        // â”€â”€ 5. Hydration Reminder â”€â”€
        try {
            Profile profile = profileRepository.findByUser(user).orElse(null);
            if (profile != null && profile.getWaterIntake() != null && profile.getWaterIntake() < 2.0) {
                advice.add("💧 Lượng nước uống đang thấp (" + profile.getWaterIntake() + "L). Mục tiêu tối thiểu 2-3L nước mỗi ngày.");
            }
        } catch (Exception ignored) {}

        // â”€â”€ 6. General Fallback â”€â”€
        if (advice.isEmpty()) {
            advice.add("🌟 Bạn đang trên đúng quỹ đạo! Sự nhất quán là chìa khóa. Hãy tiếp tục ghi log và theo dõi tiến độ mỗi ngày.");
        }

        return advice;
    }

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKey;

    @Value("${gemini.chat.model:gemini-2.5-flash}")
    private String geminiChatModel;

    @Value("${gemini.premium.model:gemini-2.5-flash}")
    private String geminiPremiumModel;

    @Value("${gemini.roadmap.model:gemini-2.5-flash}")
    private String geminiRoadmapModel;

    @SuppressWarnings("unchecked")
    public String getChatResponse(String email, String message, String imageBase64) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Profile profile = profileRepository.findByUser(user).orElseGet(() -> {
            Profile p = new Profile();
            p.setUser(user);
            return p;
        });

        boolean isPremium = user.getRoles() != null && user.getRoles().contains("ROLE_PREMIUM");

        LocalDate today = LocalDate.now();
        if (profile.getLastAiChatDate() == null || !profile.getLastAiChatDate().equals(today)) {
            profile.setLastAiChatDate(today);
            profile.setAiChatCount(0);
        }
        
        System.out.println("AI Chat Check - Email: " + email + ", Count: " + profile.getAiChatCount() + ", Premium: " + isPremium);

        if (!isPremium && profile.getAiChatCount() != null && profile.getAiChatCount() >= 5) {
            return "⛔ Bạn đã đạt giới hạn 5 tin nhắn/ngày của gói Free. Nâng cấp Premium để trò chuyện và dùng tính năng chụp ảnh phân tích!";
        }
        if (!isPremium && imageBase64 != null && !imageBase64.isEmpty()) {
            return "📸 Tính năng 'Mắt thần' (Gửi ảnh) chỉ dành cho khách Premium. Hãy nâng cấp để mở khóa nhé!";
        }

        profile.setAiChatCount(profile.getAiChatCount() == null ? 1 : profile.getAiChatCount() + 1);
        profileRepository.save(profile);
        
        // --- 1. Tá»•ng há»£p Context (dá»¯ liá»‡u cÃ¡ nhÃ¢n) ---
        StringBuilder context = new StringBuilder();
        context.append("Tên người dùng: ").append(user.getName()).append(".\n");

        if (isPremium) {
            if (profile != null && profile.getId() != null) {
            String goal = profile.getGoal() != null ? profile.getGoal().name() : "Chưa xác định";
            Double weight = profile.getWeight();
            context.append("Hồ sơ: Mục tiêu [").append(goal)
                   .append("], Thể trọng [").append(weight != null ? weight + "kg" : "chưa rõ")
                   .append("], Tỉ lệ mỡ [").append(profile.getBodyFat() != null ? profile.getBodyFat() + "%" : "chưa rõ")
                   .append("], Trình độ [").append(profile.getExperienceLevel() != null ? profile.getExperienceLevel() : "Người mới")
                   .append("], Loại hình tập [").append(profile.getPreferredWorkoutType() != null ? profile.getPreferredWorkoutType() : "Gym")
                   .append("].\n");
        }

        // Dinh dÆ°á»¡ng
        try {
            Map<String, Object> nutrition = nutritionService.getDailyNutrition(email, LocalDate.now());
            Map<String, Object> totals = (Map<String, Object>) nutrition.get("totals");
            Integer targetCals = (Integer) nutrition.get("target");
            if (totals != null) {
                int cals = ((Number) totals.get("calories")).intValue();
                int pro = ((Number) totals.get("protein")).intValue();
                context.append("Dinh dưỡng hôm nay: Đã nạp ").append(cals).append(" kcal / ").append(targetCals != null ? targetCals : "?").append(" kcal mục tiêu. ");
                context.append("Protein đạt ").append(pro).append("g.\n");
            }
            List<FoodLog> logs = (List<FoodLog>) nutrition.get("logs");
            if (logs != null && !logs.isEmpty()) {
                context.append("Danh sách thực phẩm hôm nay: ");
                logs.forEach(l -> context.append(l.getFoodName()).append(" (").append(l.getCalories()).append(" kcal), "));
                context.append("\n");
            } else {
                context.append("Dinh dưỡng: CHƯA NHẬP BẤT KỲ MÓN ĂN NÀO HÔM NAY.\n");
            }
        } catch (Exception ignored) {}

        // Tiáº¿n Ä‘á»™ / Workout
        try {
            Map<String, Object> comparison = analyticsService.getWeeklyComparison(email);
            if (comparison != null) {
                double delta = ((Number) comparison.get("deltaPercentage")).doubleValue();
                context.append("Tiến độ theo tuần: Khối lượng tập ").append(delta >= 0 ? "TĂNG " : "GIẢM ").append(Math.abs(Math.round(delta))).append("% so với tuần trước.\n");
            }
            List<WorkoutSession> sessions = workoutSessionRepository.findByUserOrderByStartTimeDesc(user);
            if (!sessions.isEmpty()) {
                WorkoutSession last = sessions.get(0);
                boolean isToday = last.getStartTime().toLocalDate().equals(LocalDate.now());
                context.append("Trạng thái tập: ").append(isToday ? "ĐÃ TẬP HÔM NAY" : "CHƯA TẬP HÔM NAY").append(". ");
                context.append("Buổi tập gần nhất: Ngày ").append(last.getStartTime().toLocalDate().toString())
                       .append(" (Hoàn thành ").append(last.getWorkoutSets().size()).append(" hiệp tập).\n");
                
                if (!last.getWorkoutSets().isEmpty()) {
                    context.append("Chi tiết bài tập gần nhất: ");
                    last.getWorkoutSets().stream().map(s -> s.getWorkoutExercise().getExercise().getName())
                        .distinct().limit(5).forEach(name -> context.append(name).append(", "));
                    context.append("...\n");
                }
            } else {
                context.append("Trạng thái tập: CHƯA CÓ DỮ LIỆU TẬP LUYỆN NÀO TRÊN HỆ THỐNG.\n");
            }
            
            Map<String, String> stagnation = analyticsService.detectStagnation(email);
            if (stagnation != null && "STAGNANT".equals(stagnation.get("status"))) {
                context.append("Chú ý từ hệ thống: Khối lượng tập đang bị CHỮNG LẠI trong 3 buổi gần nhất.\n");
            }
        } catch (Exception ignored) {}
        } else {
            context.append("Trạng thái: Khách Free (chỉ cung cấp ngữ cảnh tối giản).\n");
        }

        // --- 2. Gá»i Gemini API ---
        if (geminiApiKey != null && !geminiApiKey.isEmpty()) {
            try {
                RestTemplate restTemplate = new RestTemplate();
                String modelName = isPremium ? geminiPremiumModel : geminiChatModel;
                String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + geminiApiKey;

                String systemInstruction = "Bạn là một PT chuyên nghiệp với 10 năm kinh nghiệm. " +
                    "Chỉ trả lời các câu hỏi liên quan đến sức khỏe, gym và dinh dưỡng. " +

    @SuppressWarnings("unchecked")
    public String getChatResponse(String email, String message, String imageBase64) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Profile profile = profileRepository.findByUser(user).orElseGet(() -> {
            Profile p = new Profile();
            p.setUser(user);
            return p;
        });

        boolean isPremium = user.getRoles() != null && user.getRoles().contains("ROLE_PREMIUM");

        LocalDate today = LocalDate.now();
        if (profile.getLastAiChatDate() == null || !profile.getLastAiChatDate().equals(today)) {
            profile.setLastAiChatDate(today);
            profile.setAiChatCount(0);
        }
        
        System.out.println("AI Chat Check - Email: " + email + ", Count: " + profile.getAiChatCount() + ", Premium: " + isPremium);

        if (!isPremium && profile.getAiChatCount() != null && profile.getAiChatCount() >= 5) {
            return "⛔ Bạn đã đạt giới hạn 5 tin nhắn/ngày của gói Free. Nâng cấp Premium để trò chuyện và dùng tính năng chụp ảnh phân tích!";
        }
        if (!isPremium && imageBase64 != null && !imageBase64.isEmpty()) {
            return "📸 Tính năng 'Mắt thần' (Gửi ảnh) chỉ dành cho khách Premium. Hãy nâng cấp để mở khóa nhé!";
        }

        profile.setAiChatCount(profile.getAiChatCount() == null ? 1 : profile.getAiChatCount() + 1);
        profileRepository.save(profile);
        
        // --- 1. Tổng hợp Context (dữ liệu cá nhân) ---
        StringBuilder context = new StringBuilder();
        context.append("Tên người dùng: ").append(user.getName()).append(".\n");

        if (isPremium) {
            if (profile != null && profile.getId() != null) {
            String goal = profile.getGoal() != null ? profile.getGoal().name() : "Chưa xác định";
            Double weight = profile.getWeight();
            context.append("Hồ sơ: Mục tiêu [").append(goal)
                   .append("], Thể trọng [").append(weight != null ? weight + "kg" : "chưa rõ")
                   .append("], Tỉ lệ mỡ [").append(profile.getBodyFat() != null ? profile.getBodyFat() + "%" : "chưa rõ")
                   .append("], Trình độ [").append(profile.getExperienceLevel() != null ? profile.getExperienceLevel() : "Người mới")
                   .append("], Loại hình tập [").append(profile.getPreferredWorkoutType() != null ? profile.getPreferredWorkoutType() : "Gym")
                   .append("].\n");
        }

        // Dinh dưỡng
        try {
            Map<String, Object> nutrition = nutritionService.getDailyNutrition(email, LocalDate.now());
            Map<String, Object> totals = (Map<String, Object>) nutrition.get("totals");
            Integer targetCals = (Integer) nutrition.get("target");
            if (totals != null) {
                int cals = ((Number) totals.get("calories")).intValue();
                int pro = ((Number) totals.get("protein")).intValue();
                context.append("Dinh dưỡng hôm nay: Đã nạp ").append(cals).append(" kcal / ").append(targetCals != null ? targetCals : "?").append(" kcal mục tiêu. ");
                context.append("Protein đạt ").append(pro).append("g.\n");
            }
            List<FoodLog> logs = (List<FoodLog>) nutrition.get("logs");
            if (logs != null && !logs.isEmpty()) {
                context.append("Danh sách thực phẩm hôm nay: ");
                logs.forEach(l -> context.append(l.getFoodName()).append(" (").append(l.getCalories()).append(" kcal), "));
                context.append("\n");
            } else {
                context.append("Dinh dưỡng: CHƯA NHẬP BẤT KỲ MÓN ĂN NÀO HÔM NAY.\n");
            }
        } catch (Exception ignored) {}

        // Tiến độ / Workout
        try {
            Map<String, Object> comparison = analyticsService.getWeeklyComparison(email);
            if (comparison != null) {
                double delta = ((Number) comparison.get("deltaPercentage")).doubleValue();
                context.append("Tiến độ theo tuần: Khối lượng tập ").append(delta >= 0 ? "TĂNG " : "GIẢM ").append(Math.abs(Math.round(delta))).append("% so với tuần trước.\n");
            }
            List<WorkoutSession> sessions = workoutSessionRepository.findByUserOrderByStartTimeDesc(user);
            if (!sessions.isEmpty()) {
                WorkoutSession last = sessions.get(0);
                boolean isToday = last.getStartTime().toLocalDate().equals(LocalDate.now());
                context.append("Trạng thái tập: ").append(isToday ? "ĐÃ TẬP HÔM NAY" : "CHƯA TẬP HÔM NAY").append(". ");
                context.append("Buổi tập gần nhất: Ngày ").append(last.getStartTime().toLocalDate().toString())
                       .append(" (Hoàn thành ").append(last.getWorkoutSets().size()).append(" hiệp tập).\n");
                
                if (!last.getWorkoutSets().isEmpty()) {
                    context.append("Chi tiết bài tập gần nhất: ");
                    last.getWorkoutSets().stream().map(s -> s.getWorkoutExercise().getExercise().getName())
                        .distinct().limit(5).forEach(name -> context.append(name).append(", "));
                    context.append("...\n");
                }
            } else {
                context.append("Trạng thái tập: CHƯA CÓ DỮ LIỆU TẬP LUYỆN NÀO TRÊN HỆ THỐNG.\n");
            }
            
            Map<String, String> stagnation = analyticsService.detectStagnation(email);
            if (stagnation != null && "STAGNANT".equals(stagnation.get("status"))) {
                context.append("Chú ý từ hệ thống: Khối lượng tập đang bị CHỮNG LẠI trong 3 buổi gần nhất.\n");
            }
        } catch (Exception ignored) {}
        } else {
            context.append("Trạng thái: Khách Free (chỉ cung cấp ngữ cảnh tối giản).\n");
        }

        // --- 2. Gọi Gemini API ---
        if (geminiApiKey != null && !geminiApiKey.isEmpty()) {
            try {
                RestTemplate restTemplate = new RestTemplate();
                String modelName = isPremium ? geminiPremiumModel : geminiChatModel;
                String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + geminiApiKey;

                String systemInstruction = "Bạn là một PT chuyên nghiệp với 10 năm kinh nghiệm. " +
                    "Chỉ trả lời các câu hỏi liên quan đến sức khỏe, gym và dinh dưỡng. " +
                    "Nếu user hỏi lạc đề, hãy lịch sự từ chối. Trả lời ngắn gọn, dùng gạch đầu dòng.\n" +
                    "Thông tin hồ sơ user hiện tại:\n" + context.toString();

                String prompt = "Câu hỏi của user: " + message;
                
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> systemInstructionMap = Map.of(
                    "parts", List.of(Map.of("text", systemInstruction))
                );

                List<Map<String, Object>> partsList = new ArrayList<>();
                partsList.add(Map.of("text", prompt));

                if (isPremium && imageBase64 != null && !imageBase64.isEmpty()) {
                    String cleanB64 = imageBase64.contains(",") ? imageBase64.split(",")[1] : imageBase64;
                    partsList.add(Map.of("inlineData", Map.of("mimeType", "image/jpeg", "data", cleanB64)));
                }

                Map<String, Object> contentsMap = Map.of("parts", partsList);
                Map<String, Object> requestMap = Map.of(
                    "systemInstruction", systemInstructionMap,
                    "contents", List.of(contentsMap)
                );

                String requestJson = mapper.writeValueAsString(requestMap);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);

                ResponseEntity<Map> res = restTemplate.postForEntity(url, entity, Map.class);
                if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                    List candidates = (List) res.getBody().get("candidates");
                    if (candidates != null && !candidates.isEmpty()) {
                        Map content = (Map) ((Map) candidates.get(0)).get("content");
                        List parts = (List) content.get("parts");
                        return (String) ((Map) parts.get(0)).get("text");
                    }
                }
            } catch (Exception e) {
                System.err.println("Gemini API Error: " + e.getMessage());
                if (e.getMessage() != null && e.getMessage().contains("429")) {
                    return "⚠️ Gemini đang giới hạn quota cho API key hiện tại. Mình đã nhận được lỗi 429 từ Google, bạn thử lại sau ít phút hoặc đổi sang API key/project còn quota nhé.";
                }
            }
        }

        // --- 3. Offline Fallback Logic ---
        String lowerMsg = message.toLowerCase();
        if (lowerMsg.contains("ăn") || lowerMsg.contains("calo") || lowerMsg.contains("protein")) {
            return "Dữ liệu hôm nay: " + context.toString() + " Nếu bạn thấy mệt, hãy ăn thêm tinh bột chậm trước tập nhé!";
        }
        if (lowerMsg.contains("chào")) return "Chào " + user.getName() + "! Hôm nay tập trung độ body phần nào đây?";
        
        return "Hãy duy trì giấc ngủ tốt và ăn uống hợp lý. Còn cần tư vấn thêm, cứ bảo tôi nhé! (Kết nối AI hiện đang gián đoạn).";
    }

    public String getWorkoutRoadmap(String email, Map<String, Object> scanData) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Profile profile = profileRepository.findByUser(user).orElse(null);
        
        StringBuilder context = new StringBuilder();
        context.append("Tên: ").append(user.getName()).append(".\n");
        if (profile != null) {
            context.append("Mục tiêu: ").append(profile.getGoal()).append(".\n");
            context.append("Chiều cao: ").append(profile.getHeight()).append("cm.\n");
            context.append("Cân nặng: ").append(profile.getWeight()).append("kg.\n");
        }
        context.append("Dữ liệu Quét AI mới nhất: ")
               .append("Body Fat: ").append(scanData.get("bodyFat")).append("%, ")
               .append("Ngực: ").append(scanData.get("chest")).append("cm, ")
               .append("Eo: ").append(scanData.get("waist")).append("cm, ")
               .append("Hông: ").append(scanData.get("hips")).append("cm.\n");

        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return "{\"error\": \"Gemini API Key missing\"}";
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiRoadmapModel + ":generateContent?key=" + geminiApiKey;
            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                List candidates = (List) res.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map content = (Map) ((Map) candidates.get(0)).get("content");
                    List parts = (List) content.get("parts");
                    return (String) ((Map) parts.get(0)).get("text");
                }
            }
        } catch (Exception e) {
            System.err.println("Roadmap Generation Error: " + e.getMessage());
        }

        return "{\"error\": \"Không thể tạo lộ trình lúc này.\"}";
    }
}
