package com.aurafitness.controller;

import com.aurafitness.entity.User;
import com.aurafitness.repository.UserRepository;
import com.aurafitness.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public PaymentController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    /**
     * Webhook simulation for Casso/SePay (Popular VN payment bank sync services)
     * URL: /api/payment/webhook
     * MBBank transactions will hit this endpoint automatically via these services.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleBankWebhook(@RequestBody Map<String, Object> payload) {
        System.out.println("--- RECEIVED BANK TRANSACTION WEBHOOK ---");
        System.out.println(payload);

        // Casso/SePay payload usually contains 'description' or 'content'
        // Format of content: AuraVIP [Email/Name] [Plan]
        String description = (String) payload.getOrDefault("content", payload.getOrDefault("description", ""));
        
        if (description != null && description.contains("AuraVIP")) {
            // Find user email in the description
            String[] parts = description.split(" ");
            for (String part : parts) {
                Optional<User> userOpt = userRepository.findByEmail(part);
                if (userOpt.isPresent()) {
                    authService.upgradeToPremium(userOpt.get().getEmail());
                    System.out.println("SUCCESS: Automatic Upgrade for User: " + userOpt.get().getEmail());
                    return ResponseEntity.ok("Successfully upgraded");
                }
            }
        }
        
        return ResponseEntity.ok("Webhook received, but no matching user found in description.");
    }

    // For Demo: Client can poll to check if they are already Premium
    @GetMapping("/check-status")
    public ResponseEntity<Map<String, Boolean>> checkPaymentStatus(
            @RequestParam(required = false) String email,
            Authentication authentication
    ) {
        String lookupEmail = authentication != null ? authentication.getName() : email;
        if (lookupEmail == null || lookupEmail.isBlank()) {
            return ResponseEntity.ok(Map.of("isPremium", false));
        }

        Optional<User> userOpt = userRepository.findByEmail(lookupEmail);
        boolean isPremium = userOpt.isPresent() && userOpt.get().getRoles().contains("ROLE_PREMIUM");
        return ResponseEntity.ok(Map.of("isPremium", isPremium));
    }
}
