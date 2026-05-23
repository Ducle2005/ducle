package com.gymmanagement.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.gymmanagement.entity.Customer;
import com.gymmanagement.service.CurrentUserService;

@RestController
@RequestMapping("api")
public class MvpDashboardController {

	private final Map<String, List<Map<String, Object>>> workoutPlansByEmail = new ConcurrentHashMap<String, List<Map<String, Object>>>();
	private final Map<String, List<Map<String, Object>>> bodyScansByEmail = new ConcurrentHashMap<String, List<Map<String, Object>>>();
	private final Map<Long, Map<String, Object>> workoutSessionsById = new ConcurrentHashMap<Long, Map<String, Object>>();
	private final AtomicInteger planId = new AtomicInteger(100);
	private final AtomicInteger workoutExerciseId = new AtomicInteger(1000);

	@Autowired
	private CurrentUserService currentUserService;

	@Value("${gemini.api-key:}")
	private String geminiApiKey;

	@Value("${gemini.chat.model:gemini-2.5-flash}")
	private String geminiChatModel;

	@GetMapping("gamification/summary")
	public ResponseEntity<?> gamificationSummary(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) return unauthorized();

		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("level", 1);
		response.put("experience", 120);
		response.put("nextLevelExp", 500);
		response.put("streak", 1);
		response.put("totalAchievements", 0);
		response.put("recentAchievements", Collections.emptyList());
		return ResponseEntity.ok(response);
	}

	@GetMapping("gamification/stats")
	public ResponseEntity<?> gamificationStats(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		if (currentUserService.getCurrentCustomer(authorizationHeader) == null) return unauthorized();
		return ResponseEntity.ok(new LinkedHashMap<String, Object>());
	}

	@GetMapping("gamification/achievements")
	public ResponseEntity<?> achievements(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		if (currentUserService.getCurrentCustomer(authorizationHeader) == null) return unauthorized();
		return ResponseEntity.ok(Collections.emptyList());
	}

	@GetMapping("nutrition/daily")
	public ResponseEntity<?> dailyNutrition(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) return unauthorized();

		Map<String, Object> totals = new LinkedHashMap<String, Object>();
		totals.put("calories", 0);
		totals.put("protein", 0);
		totals.put("carbs", 0);
		totals.put("fat", 0);

		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("logs", Collections.emptyList());
		response.put("totals", totals);
		response.put("target", customer.getCalorieTarget() == null ? 2000 : customer.getCalorieTarget());
		return ResponseEntity.ok(response);
	}

	@PostMapping("nutrition/log")
	public ResponseEntity<?> logFood(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@RequestBody Map<String, Object> payload) {
		if (currentUserService.getCurrentCustomer(authorizationHeader) == null) return unauthorized();
		Map<String, Object> response = new LinkedHashMap<String, Object>(payload);
		response.put("id", System.currentTimeMillis());
		if (!response.containsKey("date")) response.put("date", LocalDate.now().toString());
		return ResponseEntity.ok(response);
	}

	@GetMapping("nutrition/weekly")
	public ResponseEntity<?> weeklyNutrition(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) return unauthorized();

		List<Map<String, Object>> days = new ArrayList<Map<String, Object>>();
		for (int i = 6; i >= 0; i--) {
			Map<String, Object> day = new LinkedHashMap<String, Object>();
			day.put("date", LocalDate.now().minusDays(i).toString());
			day.put("dayLabel", LocalDate.now().minusDays(i).getDayOfWeek().toString());
			day.put("calories", 0);
			day.put("protein", 0);
			day.put("carbs", 0);
			day.put("fat", 0);
			day.put("target", customer.getCalorieTarget() == null ? 2000 : customer.getCalorieTarget());
			days.add(day);
		}
		return ResponseEntity.ok(days);
	}

	@GetMapping("ai-coach/advice")
	public ResponseEntity<?> aiCoachAdvice(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		if (currentUserService.getCurrentCustomer(authorizationHeader) == null) return unauthorized();
		return ResponseEntity.ok(Arrays.asList(
				"Hãy cập nhật chỉ số hôm nay để Aura cá nhân hóa kế hoạch tốt hơn.",
				"Ưu tiên đủ nước, protein và hoàn thành buổi tập chính trong ngày."));
	}

	@PostMapping("ai-coach/chat")
	public ResponseEntity<?> aiCoachChat(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@RequestBody Map<String, Object> payload) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) return unauthorized();

		String message = String.valueOf(payload.getOrDefault("message", "")).trim();
		String imageBase64 = payload.get("imageBase64") == null ? "" : String.valueOf(payload.get("imageBase64"));

		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("reply", getAiCoachReply(customer, message, imageBase64));
		return ResponseEntity.ok(response);
	}

	@GetMapping("vip/insights")
	public ResponseEntity<?> vipInsights(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@RequestParam(value = "currentBpm", required = false) Integer currentBpm) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) return unauthorized();

		int age = customer.getAge() > 0 ? customer.getAge() : 25;
		int hrMax = Math.max(160, 220 - age);

		Map<String, Object> heartRate = new LinkedHashMap<String, Object>();
		heartRate.put("hrMax", hrMax);
		heartRate.put("fatBurnZone", range(Math.round(hrMax * 0.60f), Math.round(hrMax * 0.70f)));
		heartRate.put("cardioZone", range(Math.round(hrMax * 0.70f), Math.round(hrMax * 0.84f)));
		heartRate.put("peakZone", range(Math.round(hrMax * 0.84f), Math.round(hrMax * 0.95f)));
		if (currentBpm != null) {
			heartRate.put("currentZone", currentBpm < hrMax * 0.70 ? "FAT_BURN" : currentBpm < hrMax * 0.84 ? "CARDIO" : "PEAK");
		}

		Map<String, Object> progressiveOverload = new LinkedHashMap<String, Object>();
		progressiveOverload.put("totalVolume", 0);
		progressiveOverload.put("deltaPercentage", 0);
		progressiveOverload.put("trend", "UP");
		progressiveOverload.put("insight", "Hãy ghi log vài buổi tập để AI phân tích cường độ và mức tăng tải chính xác hơn.");

		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("heartRate", heartRate);
		response.put("readiness", "Cơ thể đang ở trạng thái sẵn sàng cơ bản. Hãy ưu tiên khởi động kỹ và tăng tải từ từ.");
		response.put("progressiveOverload", progressiveOverload);
		return ResponseEntity.ok(response);
	}

	@GetMapping("vip/body-scan/history")
	public ResponseEntity<?> bodyScanHistory(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) return unauthorized();
		return ResponseEntity.ok(bodyScansFor(customer));
	}

	@PostMapping(value = "vip/body-scan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> saveBodyScan(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@RequestParam Map<String, String> payload) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) return unauthorized();

		Map<String, Object> scan = new LinkedHashMap<String, Object>();
		scan.put("id", System.currentTimeMillis());
		scan.put("date", java.time.Instant.now().toString());
		scan.put("bodyFat", numberValue(payload.get("bodyFat"), 18.5));
		scan.put("chest", numberValue(payload.get("chest"), 98));
		scan.put("waist", numberValue(payload.get("waist"), 78));
		scan.put("hips", numberValue(payload.get("hips"), 92));
		scan.put("weight", numberValue(payload.get("weight"), numberValue(customer.getWeight(), 75)));
		scan.put("imageUrl", "/onboarding/body-scan-demo.svg");
		bodyScansFor(customer).add(0, scan);
		return ResponseEntity.ok(scan);
	}

	@PostMapping("vip/roadmap")
	public ResponseEntity<?> vipRoadmap(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@RequestBody Map<String, Object> payload) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) return unauthorized();
		return ResponseEntity.ok(buildRoadmap(customer, payload));
	}

	@GetMapping("exercises")
	public ResponseEntity<?> exercises(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "20") int size) {
		if (currentUserService.getCurrentCustomer(authorizationHeader) == null) return unauthorized();

		List<Map<String, Object>> catalog = exerciseCatalog();
		int from = Math.max(0, Math.min(page * size, catalog.size()));
		int to = Math.max(from, Math.min(from + size, catalog.size()));
		List<Map<String, Object>> content = catalog.subList(from, to);

		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("content", content);
		response.put("page", page);
		response.put("size", size);
		response.put("totalElements", catalog.size());
		response.put("totalPages", (int) Math.ceil((double) catalog.size() / Math.max(1, size)));
		response.put("hasNext", to < catalog.size());
		response.put("hasPrevious", page > 0);
		return ResponseEntity.ok(response);
	}

	@GetMapping("exercises/{id}")
	public ResponseEntity<?> exerciseById(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@PathVariable("id") int id) {
		if (currentUserService.getCurrentCustomer(authorizationHeader) == null) return unauthorized();
		return exerciseCatalog().stream()
				.filter(exercise -> ((Integer) exercise.get("id")) == id)
				.findFirst()
				.<ResponseEntity<?>>map(ResponseEntity::ok)
				.orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("Exercise not found")));
	}

	@GetMapping("workouts/plans")
	public ResponseEntity<?> workoutPlans(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) return unauthorized();
		return ResponseEntity.ok(plansFor(customer));
	}

	@GetMapping("workouts/plans/today")
	public ResponseEntity<?> todaysWorkout(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) return unauthorized();
		List<Map<String, Object>> plans = plansFor(customer);
		return ResponseEntity.ok(plans.isEmpty() ? null : plans.get(0));
	}

	@PostMapping("workouts/plans")
	public ResponseEntity<?> createWorkoutPlan(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@RequestBody Map<String, Object> payload) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) return unauthorized();

		Map<String, Object> plan = normalizePlan(payload);
		plansFor(customer).add(plan);
		return ResponseEntity.ok(plan);
	}

	@PutMapping("workouts/plans/{id}")
	public ResponseEntity<?> updateWorkoutPlan(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@PathVariable("id") int id,
			@RequestBody Map<String, Object> payload) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) return unauthorized();
		Map<String, Object> updated = normalizePlan(payload);
		updated.put("id", id);

		List<Map<String, Object>> plans = plansFor(customer);
		for (int i = 0; i < plans.size(); i++) {
			if (((Integer) plans.get(i).get("id")) == id) {
				plans.set(i, updated);
				return ResponseEntity.ok(updated);
			}
		}
		plans.add(updated);
		return ResponseEntity.ok(updated);
	}

	@PostMapping("workouts/sessions/start")
	public ResponseEntity<?> startSession(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@RequestParam(value = "planId", required = false) Integer requestedPlanId) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) return unauthorized();

		Map<String, Object> workoutPlan = null;
		if (requestedPlanId != null) {
			for (Map<String, Object> plan : plansFor(customer)) {
				Object id = plan.get("id");
				if (id instanceof Number && ((Number) id).intValue() == requestedPlanId.intValue()) {
					workoutPlan = plan;
					break;
				}
			}
		}

		long id = System.currentTimeMillis();
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("id", id);
		response.put("workoutPlan", workoutPlan);
		response.put("startTime", java.time.Instant.now().toString());
		response.put("endTime", null);
		response.put("status", "IN_PROGRESS");
		response.put("workoutSets", Collections.emptyList());
		workoutSessionsById.put(id, response);
		return ResponseEntity.ok(response);
	}

	@PutMapping("workouts/sessions/{sessionId}/sets")
	public ResponseEntity<?> saveSessionSets(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@PathVariable("sessionId") long sessionId,
			@RequestBody Map<String, Object> payload) {
		if (currentUserService.getCurrentCustomer(authorizationHeader) == null) return unauthorized();

		Map<String, Object> session = workoutSessionsById.computeIfAbsent(sessionId, key -> {
			Map<String, Object> created = new LinkedHashMap<String, Object>();
			created.put("id", sessionId);
			created.put("workoutPlan", null);
			created.put("startTime", java.time.Instant.now().toString());
			created.put("endTime", null);
			created.put("status", "IN_PROGRESS");
			created.put("workoutSets", Collections.emptyList());
			return created;
		});

		Object sets = payload.get("sets");
		session.put("workoutSets", sets instanceof List ? sets : Collections.emptyList());
		return ResponseEntity.ok(session);
	}

	@PostMapping("workouts/sessions/{sessionId}/complete")
	public ResponseEntity<?> completeSession(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@PathVariable("sessionId") long sessionId) {
		if (currentUserService.getCurrentCustomer(authorizationHeader) == null) return unauthorized();

		Map<String, Object> session = workoutSessionsById.computeIfAbsent(sessionId, key -> {
			Map<String, Object> created = new LinkedHashMap<String, Object>();
			created.put("id", sessionId);
			created.put("workoutPlan", null);
			created.put("startTime", java.time.Instant.now().toString());
			created.put("workoutSets", Collections.emptyList());
			return created;
		});

		session.put("endTime", java.time.Instant.now().toString());
		session.put("status", "COMPLETED");
		return ResponseEntity.ok(session);
	}

	@GetMapping("workouts/sessions/history")
	public ResponseEntity<?> history(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		if (currentUserService.getCurrentCustomer(authorizationHeader) == null) return unauthorized();
		return ResponseEntity.ok(Collections.emptyList());
	}

	@GetMapping("workouts/exercises/{exerciseId}/performance")
	public ResponseEntity<?> exercisePerformance(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@PathVariable("exerciseId") int exerciseId) {
		if (currentUserService.getCurrentCustomer(authorizationHeader) == null) return unauthorized();

		Map<String, Object> exercise = exerciseByCatalogId(exerciseId);
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("exerciseId", exerciseId);
		response.put("exerciseName", exercise.get("name"));
		response.put("bestWeight", 0);
		response.put("bestReps", 0);
		response.put("bestOneRepMax", 0);
		response.put("bestVolume", 0);
		response.put("trend", "INSUFFICIENT_DATA");
		response.put("recommendation", "Hoàn thành vài buổi tập để Aura có đủ dữ liệu phân tích hiệu suất.");
		response.put("recentSets", Collections.emptyList());
		return ResponseEntity.ok(response);
	}

	@GetMapping("analytics/weight")
	public ResponseEntity<?> weightAnalytics(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		if (currentUserService.getCurrentCustomer(authorizationHeader) == null) return unauthorized();
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("history", Collections.emptyList());
		response.put("change7d", 0);
		response.put("change30d", 0);
		return ResponseEntity.ok(response);
	}

	@GetMapping("analytics/volume")
	public ResponseEntity<?> volumeAnalytics(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		if (currentUserService.getCurrentCustomer(authorizationHeader) == null) return unauthorized();
		return ResponseEntity.ok(Collections.emptyList());
	}

	@GetMapping("analytics/weekly")
	public ResponseEntity<?> weeklyAnalytics(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		if (currentUserService.getCurrentCustomer(authorizationHeader) == null) return unauthorized();
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("currentWeekVolume", 0);
		response.put("lastWeekVolume", 0);
		response.put("deltaPercentage", 0);
		return ResponseEntity.ok(response);
	}

	@GetMapping("analytics/stagnation")
	public ResponseEntity<?> stagnation(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		if (currentUserService.getCurrentCustomer(authorizationHeader) == null) return unauthorized();
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("status", "INSUFFICIENT_DATA");
		response.put("advice", "Hãy ghi log thêm vài buổi tập để Aura phân tích xu hướng.");
		return ResponseEntity.ok(response);
	}

	private String getAiCoachReply(Customer customer, String message, String imageBase64) {
		String cleanMessage = message == null ? "" : message.trim();
		if (cleanMessage.isEmpty()) {
			cleanMessage = imageBase64 == null || imageBase64.trim().isEmpty()
					? "Hãy đưa cho tôi một lời khuyên tập luyện hôm nay."
					: "Hãy phân tích hình ảnh này và đưa ra góp ý thể hình.";
		}

		if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
			return "AI chưa được cấu hình trên server. Hãy thêm biến môi trường GEMINI_API_KEY trên Render rồi redeploy backend.";
		}

		String prompt = buildAiPrompt(customer, cleanMessage);
		try {
			return callGemini(prompt, imageBase64);
		} catch (Exception ex) {
			System.err.println("Gemini API error: " + ex.getMessage());
			return "AI đang gặp lỗi kết nối tới API Gemini. Bạn kiểm tra GEMINI_API_KEY trên Render hoặc thử lại sau ít phút nhé.";
		}
	}

	private String buildAiPrompt(Customer customer, String message) {
		StringBuilder prompt = new StringBuilder();
		prompt.append("Bạn là huấn luyện viên cá nhân AI của Aura Fitness.\n");
		prompt.append("Trả lời bằng tiếng Việt tự nhiên, ngắn gọn, dễ làm theo.\n");
		prompt.append("Chỉ tư vấn tập luyện, dinh dưỡng, phục hồi và sức khỏe cơ bản. Nếu có dấu hiệu nguy hiểm, hãy khuyên người dùng gặp chuyên gia y tế.\n\n");
		prompt.append("Hồ sơ người dùng:\n");
		prompt.append("- Tên: ").append(nonBlank(customer.getName(), "chưa rõ")).append("\n");
		prompt.append("- Email: ").append(nonBlank(customer.getEmailId(), "chưa rõ")).append("\n");
		prompt.append("- Tuổi: ").append(customer.getAge() > 0 ? customer.getAge() : "chưa rõ").append("\n");
		prompt.append("- Giới tính: ").append(nonBlank(customer.getSex(), "chưa rõ")).append("\n");
		prompt.append("- Cân nặng: ").append(nonBlank(customer.getWeight(), "chưa rõ")).append("\n");
		prompt.append("- Chiều cao: ").append(customer.getHeight() == null ? "chưa rõ" : customer.getHeight() + " cm").append("\n");
		prompt.append("- Mỡ: ").append(customer.getBodyFat() == null ? "chưa rõ" : customer.getBodyFat() + "%").append("\n");
		prompt.append("- Cơ bắp: ").append(customer.getMuscleMass() == null ? "chưa rõ" : customer.getMuscleMass() + " kg").append("\n");
		prompt.append("- Mục tiêu: ").append(nonBlank(customer.getGoal(), "chưa rõ")).append("\n");
		prompt.append("- Mục tiêu calorie: ").append(customer.getCalorieTarget() == null ? "chưa rõ" : customer.getCalorieTarget()).append("\n");
		prompt.append("- Số ngày tập/tuần: ").append(customer.getWorkoutDaysPerWeek() == null ? "chưa rõ" : customer.getWorkoutDaysPerWeek()).append("\n");
		prompt.append("- Kinh nghiệm: ").append(nonBlank(customer.getExperienceLevel(), "chưa rõ")).append("\n");
		prompt.append("- Kiểu tập ưa thích: ").append(nonBlank(customer.getPreferredWorkoutType(), "chưa rõ")).append("\n");
		prompt.append("- Số kế hoạch tập hiện có: ").append(plansFor(customer).size()).append("\n\n");
		prompt.append("Câu hỏi của người dùng:\n").append(message);
		return prompt.toString();
	}

	@SuppressWarnings("unchecked")
	private String callGemini(String prompt, String imageBase64) {
		String url = "https://generativelanguage.googleapis.com/v1beta/models/"
				+ nonBlank(geminiChatModel, "gemini-2.5-flash")
				+ ":generateContent?key=" + geminiApiKey.trim();

		List<Map<String, Object>> parts = new ArrayList<Map<String, Object>>();
		Map<String, Object> textPart = new LinkedHashMap<String, Object>();
		textPart.put("text", prompt);
		parts.add(textPart);

		if (imageBase64 != null && !imageBase64.trim().isEmpty()) {
			Map<String, Object> inlineData = new LinkedHashMap<String, Object>();
			inlineData.put("mime_type", mimeTypeFromDataUrl(imageBase64));
			inlineData.put("data", stripDataUrlPrefix(imageBase64));

			Map<String, Object> imagePart = new LinkedHashMap<String, Object>();
			imagePart.put("inline_data", inlineData);
			parts.add(imagePart);
		}

		Map<String, Object> content = new LinkedHashMap<String, Object>();
		content.put("role", "user");
		content.put("parts", parts);

		List<Map<String, Object>> contents = new ArrayList<Map<String, Object>>();
		contents.add(content);

		Map<String, Object> generationConfig = new LinkedHashMap<String, Object>();
		generationConfig.put("temperature", 0.7);
		generationConfig.put("maxOutputTokens", 768);

		Map<String, Object> request = new LinkedHashMap<String, Object>();
		request.put("contents", contents);
		request.put("generationConfig", generationConfig);

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		ResponseEntity<Map> response = new RestTemplate().postForEntity(url, new HttpEntity<Map<String, Object>>(request, headers), Map.class);
		String reply = extractGeminiText(response.getBody());
		return reply.isEmpty() ? "AI đã nhận câu hỏi nhưng chưa trả về nội dung. Bạn thử lại giúp mình nhé." : reply;
	}

	private String extractGeminiText(Map<?, ?> body) {
		if (body == null) return "";
		Object candidatesValue = body.get("candidates");
		if (!(candidatesValue instanceof List) || ((List<?>) candidatesValue).isEmpty()) return "";
		Object firstValue = ((List<?>) candidatesValue).get(0);
		if (!(firstValue instanceof Map)) return "";
		Object contentValue = ((Map<?, ?>) firstValue).get("content");
		if (!(contentValue instanceof Map)) return "";
		Object partsValue = ((Map<?, ?>) contentValue).get("parts");
		if (!(partsValue instanceof List) || ((List<?>) partsValue).isEmpty()) return "";
		Object partValue = ((List<?>) partsValue).get(0);
		if (!(partValue instanceof Map)) return "";
		Object textValue = ((Map<?, ?>) partValue).get("text");
		return textValue == null ? "" : String.valueOf(textValue).trim();
	}

	private String mimeTypeFromDataUrl(String value) {
		if (value != null && value.startsWith("data:") && value.contains(";base64,")) {
			return value.substring(5, value.indexOf(";base64,"));
		}
		return "image/jpeg";
	}

	private String stripDataUrlPrefix(String value) {
		if (value == null) return "";
		int marker = value.indexOf(";base64,");
		return marker >= 0 ? value.substring(marker + 8) : value;
	}

	private String nonBlank(String value, String fallback) {
		return value == null || value.trim().isEmpty() ? fallback : value.trim();
	}

	private Map<String, Object> buildRoadmap(Customer customer, Map<String, Object> scanData) {
		double bodyFat = numberValue(scanData.get("bodyFat"), 18.5);
		double waist = numberValue(scanData.get("waist"), 78);
		double chest = numberValue(scanData.get("chest"), 98);
		String aiOverview = "Dựa trên chỉ số hiện tại, Aura đề xuất lộ trình 8 tuần tập trung tăng nền tảng, siết kỹ thuật và cải thiện vóc dáng bền vững.";

		if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
			StringBuilder prompt = new StringBuilder();
			prompt.append("Bạn là AI fitness coach của Aura. Viết một đoạn tổng quan tiếng Việt 2 câu cho lộ trình tập luyện dựa trên dữ liệu sau.\n");
			prompt.append("Mục tiêu: ").append(nonBlank(customer.getGoal(), "cải thiện thể hình")).append("\n");
			prompt.append("Kinh nghiệm: ").append(nonBlank(customer.getExperienceLevel(), "chưa rõ")).append("\n");
			prompt.append("Body fat: ").append(bodyFat).append("%, ngực: ").append(chest).append("cm, eo: ").append(waist).append("cm.\n");
			prompt.append("Không trả về JSON, chỉ trả lời đoạn văn ngắn.");
			try {
				aiOverview = callGemini(prompt.toString(), "");
			} catch (Exception ex) {
				System.err.println("Gemini roadmap error: " + ex.getMessage());
			}
		}

		List<Map<String, Object>> phases = new ArrayList<Map<String, Object>>();
		phases.add(roadmapPhase("Nền tảng", "Kỹ thuật và nhịp tập", "1-2", "Ổn định form, làm quen lịch tập và giữ cường độ vừa sức.", Arrays.asList("Squat", "Push Up", "Plank")));
		phases.add(roadmapPhase("Tăng lực", "Progressive overload", "3-4", "Tăng dần khối lượng tạ hoặc số reps, ưu tiên bài compound.", Arrays.asList("Bench Press", "Barbell Row", "Romanian Deadlift")));
		phases.add(roadmapPhase("Siết dáng", "Eo và sức bền", "5-6", "Kết hợp kháng lực với cardio vùng đốt mỡ để cải thiện tỷ lệ cơ mỡ.", Arrays.asList("Incline Press", "Lateral Raise", "Mountain Climber")));
		phases.add(roadmapPhase("Tối ưu", "Đo lại và tinh chỉnh", "7-8", "Theo dõi số đo, giảm bài dư và giữ các bài tạo tiến bộ rõ nhất.", Arrays.asList("Deadlift", "Pull Up", "Leg Press")));

		Map<String, Object> roadmap = new LinkedHashMap<String, Object>();
		roadmap.put("title", "Lộ trình AI Aura Elite");
		roadmap.put("overview", aiOverview);
		roadmap.put("phases", phases);
		roadmap.put("nutritionAdvice", bodyFat > 22
				? "Giữ thâm hụt nhẹ 300-400 kcal/ngày, ưu tiên protein nạc, rau xanh và nước trước mỗi bữa."
				: "Giữ protein 1.6-2.2g/kg cân nặng, thêm carb quanh buổi tập để có năng lượng tăng cơ.");
		roadmap.put("recoveryTip", "Ngủ 7-8 tiếng, giãn cơ 5 phút sau buổi tập và dành ít nhất 1 ngày/tuần để phục hồi chủ động.");
		return roadmap;
	}

	private Map<String, Object> roadmapPhase(String name, String focus, String weeks, String details, List<String> exercises) {
		Map<String, Object> phase = new LinkedHashMap<String, Object>();
		phase.put("name", name);
		phase.put("focus", focus);
		phase.put("weeks", weeks);
		phase.put("details", details);
		phase.put("exercises", exercises);
		return phase;
	}

	private Map<String, Integer> range(int min, int max) {
		Map<String, Integer> range = new LinkedHashMap<String, Integer>();
		range.put("min", min);
		range.put("max", max);
		return range;
	}

	private List<Map<String, Object>> bodyScansFor(Customer customer) {
		return bodyScansByEmail.computeIfAbsent(customer.getEmailId(), key -> new ArrayList<Map<String, Object>>());
	}

	private double numberValue(Object value, double fallback) {
		if (value == null) return fallback;
		if (value instanceof Number) return ((Number) value).doubleValue();
		try {
			return Double.parseDouble(String.valueOf(value).trim());
		} catch (NumberFormatException ex) {
			return fallback;
		}
	}

	private List<Map<String, Object>> plansFor(Customer customer) {
		return workoutPlansByEmail.computeIfAbsent(customer.getEmailId(), key -> new ArrayList<Map<String, Object>>());
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> normalizePlan(Map<String, Object> payload) {
		Map<String, Object> plan = new LinkedHashMap<String, Object>(payload);
		plan.put("id", planId.incrementAndGet());
		plan.putIfAbsent("description", null);
		plan.putIfAbsent("scheduledDay", null);
		plan.putIfAbsent("goal", null);
		plan.putIfAbsent("programWeek", null);
		plan.putIfAbsent("archived", false);

		List<Map<String, Object>> normalizedExercises = new ArrayList<Map<String, Object>>();
		Object workoutExercises = payload.get("workoutExercises");
		if (workoutExercises instanceof List) {
			for (Object item : (List<Object>) workoutExercises) {
				if (item instanceof Map) {
					normalizedExercises.add(normalizeWorkoutExercise((Map<String, Object>) item));
				}
			}
		}
		plan.put("workoutExercises", normalizedExercises);
		return plan;
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> normalizeWorkoutExercise(Map<String, Object> item) {
		Map<String, Object> entry = new LinkedHashMap<String, Object>(item);
		entry.put("id", workoutExerciseId.incrementAndGet());

		Object exerciseValue = item.get("exercise");
		if (exerciseValue instanceof Map && ((Map<String, Object>) exerciseValue).get("id") instanceof Number) {
			int id = ((Number) ((Map<String, Object>) exerciseValue).get("id")).intValue();
			entry.put("exercise", exerciseByCatalogId(id));
		}
		entry.putIfAbsent("sortOrder", 1);
		return entry;
	}

	private Map<String, Object> exerciseByCatalogId(int id) {
		for (Map<String, Object> exercise : exerciseCatalog()) {
			if (((Integer) exercise.get("id")) == id) {
				return exercise;
			}
		}
		return exerciseCatalog().get(0);
	}

	private List<Map<String, Object>> exerciseCatalog() {
		List<Map<String, Object>> catalog = new ArrayList<Map<String, Object>>();
		catalog.add(exercise(1, "Squat", "Legs", "Barbell", "BEGINNER"));
		catalog.add(exercise(2, "Bench Press", "Chest", "Barbell", "INTERMEDIATE"));
		catalog.add(exercise(3, "Barbell Row", "Back", "Barbell", "INTERMEDIATE"));
		catalog.add(exercise(4, "Overhead Press", "Shoulders", "Dumbbell", "BEGINNER"));
		catalog.add(exercise(5, "Plank", "Core", "Bodyweight", "BEGINNER"));
		catalog.add(exercise(6, "Incline Dumbbell Press", "Chest", "Dumbbell", "INTERMEDIATE"));
		catalog.add(exercise(7, "Pull Up", "Back", "Bodyweight", "ADVANCED"));
		catalog.add(exercise(8, "Lateral Raise", "Shoulders", "Dumbbell", "BEGINNER"));
		catalog.add(exercise(9, "Bicep Curl", "Arms", "Dumbbell", "BEGINNER"));
		catalog.add(exercise(10, "Tricep Extension", "Arms", "Dumbbell", "BEGINNER"));
		catalog.add(exercise(11, "Deadlift", "Legs", "Barbell", "INTERMEDIATE"));
		catalog.add(exercise(12, "Leg Press", "Legs", "Machine", "BEGINNER"));
		catalog.add(exercise(13, "Romanian Deadlift", "Legs", "Barbell", "INTERMEDIATE"));
		catalog.add(exercise(14, "Calf Raise", "Legs", "Machine", "BEGINNER"));
		catalog.add(exercise(15, "Crunch", "Core", "Bodyweight", "BEGINNER"));
		return catalog;
	}

	private Map<String, Object> exercise(int id, String name, String muscleGroup, String equipment, String difficulty) {
		Map<String, Object> exercise = new LinkedHashMap<String, Object>();
		exercise.put("id", id);
		exercise.put("name", name);
		exercise.put("muscleGroup", muscleGroup);
		exercise.put("equipment", equipment);
		exercise.put("difficulty", difficulty);
		exercise.put("description", name + " foundational movement.");
		exercise.put("instructions", Arrays.asList("Khởi động kỹ.", "Giữ kỹ thuật ổn định.", "Dừng lại nếu thấy đau."));
		exercise.put("imageUrl", "https://placehold.co/640x480?text=" + name.replace(" ", "+"));
		exercise.put("videoUrl", "");
		return exercise;
	}

	private ResponseEntity<?> unauthorized() {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Unauthorized"));
	}

	private Map<String, String> error(String message) {
		Map<String, String> response = new LinkedHashMap<String, String>();
		response.put("message", message);
		return response;
	}
}
