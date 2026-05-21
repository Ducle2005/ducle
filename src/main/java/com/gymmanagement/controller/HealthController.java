package com.gymmanagement.controller;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

	@GetMapping("/")
	public Map<String, Object> home() {
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("status", "ok");
		response.put("service", "Aura Fitness backend");
		response.put("apiBase", "/api");
		response.put("health", "/healthz");
		response.put("timestamp", Instant.now().toString());
		return response;
	}

	@GetMapping("/healthz")
	public Map<String, Object> health() {
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("status", "ok");
		response.put("service", "Aura Fitness backend");
		response.put("timestamp", Instant.now().toString());
		return response;
	}
}
