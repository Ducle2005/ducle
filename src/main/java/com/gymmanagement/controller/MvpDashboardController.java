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
import org.springframework.http.HttpStatus;
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

import com.gymmanagement.entity.Customer;
import com.gymmanagement.service.CurrentUserService;

@RestController
@RequestMapping("api")
public class MvpDashboardController {

	private final Map<String, List<Map<String, Object>>> workoutPlansByEmail = new ConcurrentHashMap<String, List<Map<String, Object>>>();
	private final Map<Long, Map<String, Object>> workoutSessionsById = new ConcurrentHashMap<Long, Map<String, Object>>();
	private final AtomicInteger planId = new AtomicInteger(100);
	private final AtomicInteger workoutExerciseId = new AtomicInteger(1000);

	@Autowired
	private CurrentUserService currentUserService;

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
		if (currentUserService.getCurrentCustomer(authorizationHeader) == null) return unauthorized();
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("reply", "MVP backend đã nhận câu hỏi của bạn. Hãy tiếp tục ghi log để nhận gợi ý chính xác hơn.");
		return ResponseEntity.ok(response);
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
