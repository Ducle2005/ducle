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

    // Disabled until a payment provider is configured with authenticated
    // delivery, transaction validation and replay protection. A public JSON
    // body containing an email is not proof of a bank transfer.
    @PostMapping("/webhook")
    public ResponseEntity<String> handleBankWebhook(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.status(503).body("Payment webhook is not configured");
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
