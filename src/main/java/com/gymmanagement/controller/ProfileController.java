package com.gymmanagement.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymmanagement.dao.CustomerDao;
import com.gymmanagement.entity.Customer;
import com.gymmanagement.service.CurrentUserService;

@RestController
@RequestMapping("api/profile")
public class ProfileController {

	@Autowired
	private CurrentUserService currentUserService;

	@Autowired
	private CustomerDao customerDao;

	@GetMapping
	public ResponseEntity<?> getProfile(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Unauthorized"));
		}
		return ResponseEntity.ok(toProfile(customer));
	}

	@PutMapping
	public ResponseEntity<?> updateProfile(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@RequestBody Map<String, Object> payload) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Unauthorized"));
		}

		if (payload.containsKey("age")) customer.setAge(toInt(payload.get("age"), customer.getAge()));
		if (payload.containsKey("gender")) customer.setSex(toStringOrNull(payload.get("gender")));
		if (payload.containsKey("height")) customer.setHeight(toDouble(payload.get("height")));
		if (payload.containsKey("weight")) customer.setWeight(toStringOrNull(payload.get("weight")));
		if (payload.containsKey("bodyFat")) customer.setBodyFat(toDouble(payload.get("bodyFat")));
		if (payload.containsKey("muscleMass")) customer.setMuscleMass(toDouble(payload.get("muscleMass")));
		if (payload.containsKey("waterIntake")) customer.setWaterIntake(toDouble(payload.get("waterIntake")));
		if (payload.containsKey("calorieTarget")) customer.setCalorieTarget(toInteger(payload.get("calorieTarget")));
		if (payload.containsKey("goal")) customer.setGoal(toStringOrNull(payload.get("goal")));
		if (payload.containsKey("targetWeight")) customer.setTargetWeight(toDouble(payload.get("targetWeight")));
		if (payload.containsKey("workoutDaysPerWeek")) customer.setWorkoutDaysPerWeek(toInteger(payload.get("workoutDaysPerWeek")));
		if (payload.containsKey("experienceLevel")) customer.setExperienceLevel(toStringOrNull(payload.get("experienceLevel")));
		if (payload.containsKey("preferredWorkoutType")) customer.setPreferredWorkoutType(toStringOrNull(payload.get("preferredWorkoutType")));
		if (payload.containsKey("reminderEnabled")) customer.setReminderEnabled(toBoolean(payload.get("reminderEnabled")));
		if (payload.containsKey("reminderTime")) customer.setReminderTime(toStringOrNull(payload.get("reminderTime")));
		if (payload.containsKey("reminderDays")) customer.setReminderDays(toStringOrNull(payload.get("reminderDays")));
		if (payload.containsKey("theme")) customer.setTheme(toStringOrNull(payload.get("theme")));
		if (payload.containsKey("weightUnit")) customer.setWeightUnit(toStringOrNull(payload.get("weightUnit")));
		if (payload.containsKey("heightUnit")) customer.setHeightUnit(toStringOrNull(payload.get("heightUnit")));

		customerDao.save(customer);
		return ResponseEntity.ok(toProfile(customer));
	}

	public static Map<String, Object> toProfile(Customer customer) {
		Map<String, Object> profile = new LinkedHashMap<String, Object>();
		profile.put("age", customer.getAge() == 0 ? null : customer.getAge());
		profile.put("gender", customer.getSex());
		profile.put("height", customer.getHeight());
		profile.put("weight", toDoubleValue(customer.getWeight()));
		profile.put("bodyFat", customer.getBodyFat());
		profile.put("muscleMass", customer.getMuscleMass());
		profile.put("waterIntake", customer.getWaterIntake());
		profile.put("calorieTarget", customer.getCalorieTarget() == null ? 2000 : customer.getCalorieTarget());
		profile.put("goal", customer.getGoal());
		profile.put("avatarUrl", AuthController.avatarUrl(customer));
		profile.put("targetWeight", customer.getTargetWeight());
		profile.put("workoutDaysPerWeek", customer.getWorkoutDaysPerWeek());
		profile.put("experienceLevel", customer.getExperienceLevel());
		profile.put("preferredWorkoutType", customer.getPreferredWorkoutType());
		profile.put("reminderEnabled", customer.getReminderEnabled());
		profile.put("reminderTime", customer.getReminderTime());
		profile.put("reminderDays", customer.getReminderDays());
		profile.put("theme", customer.getTheme() == null ? "DARK" : customer.getTheme());
		profile.put("weightUnit", customer.getWeightUnit() == null ? "KG" : customer.getWeightUnit());
		profile.put("heightUnit", customer.getHeightUnit() == null ? "CM" : customer.getHeightUnit());
		return profile;
	}

	private Map<String, String> error(String message) {
		Map<String, String> response = new LinkedHashMap<String, String>();
		response.put("message", message);
		return response;
	}

	private Integer toInteger(Object value) {
		Double number = toDouble(value);
		return number == null ? null : number.intValue();
	}

	private int toInt(Object value, int fallback) {
		Integer number = toInteger(value);
		return number == null ? fallback : number;
	}

	private Double toDouble(Object value) {
		if (value == null) return null;
		if (value instanceof Number) return ((Number) value).doubleValue();
		try {
			String text = String.valueOf(value).trim();
			return text.isEmpty() ? null : Double.valueOf(text);
		} catch (NumberFormatException ex) {
			return null;
		}
	}

	private static Double toDoubleValue(String value) {
		if (value == null || value.trim().isEmpty()) return null;
		try {
			return Double.valueOf(value.trim());
		} catch (NumberFormatException ex) {
			return null;
		}
	}

	private String toStringOrNull(Object value) {
		if (value == null) return null;
		String text = String.valueOf(value).trim();
		return text.isEmpty() ? null : text;
	}

	private Boolean toBoolean(Object value) {
		if (value == null) return null;
		if (value instanceof Boolean) return (Boolean) value;
		return Boolean.valueOf(String.valueOf(value));
	}
}
