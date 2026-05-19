package com.aurafitness.controller;

import com.aurafitness.service.AICoachService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai-coach")
public class AICoachController {

    private final AICoachService aiCoachService;

    public AICoachController(AICoachService aiCoachService) {
        this.aiCoachService = aiCoachService;
    }

    @GetMapping("/advice")
    public ResponseEntity<List<String>> getAdvice() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(aiCoachService.getActionableAdvice(auth.getName()));
    }

    @PostMapping("/chat")
    public ResponseEntity<java.util.Map<String, String>> chat(@RequestBody java.util.Map<String, String> request) {
        String message = request.get("message");
        String imageBase64 = request.get("imageBase64");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String reply = aiCoachService.getChatResponse(auth.getName(), message, imageBase64);
        return ResponseEntity.ok(java.util.Map.of("reply", reply));
    }
}
