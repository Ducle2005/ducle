package com.aurafitness.controller;

import com.aurafitness.dto.AuthUserDto;
import com.aurafitness.dto.JwtAuthResponse;
import com.aurafitness.dto.LoginDto;
import com.aurafitness.dto.RegisterDto;
import com.aurafitness.repository.UserRepository;
import com.aurafitness.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private AuthService authService;
    private final UserRepository userRepository;
    private final com.aurafitness.repository.ProfileRepository profileRepository;

    public AuthController(AuthService authService, UserRepository userRepository, com.aurafitness.repository.ProfileRepository profileRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    // Build Login REST API
    @PostMapping(value = {"/login", "/signin"})
    public ResponseEntity<JwtAuthResponse> login(@RequestBody LoginDto loginDto){
        String token = authService.login(loginDto);

        JwtAuthResponse jwtAuthResponse = new JwtAuthResponse();
        jwtAuthResponse.setAccessToken(token);

        return ResponseEntity.ok(jwtAuthResponse);
    }

    // Build Register REST API
    @PostMapping(value = {"/register", "/signup"})
    public ResponseEntity<String> register(@RequestBody RegisterDto registerDto){
        String response = authService.register(registerDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserDto> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        com.aurafitness.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        String avatarUrl = null;
        java.util.Optional<com.aurafitness.entity.Profile> profileOpt = profileRepository.findByUser(user);
        if (profileOpt.isPresent() && profileOpt.get().getAvatarUrl() != null) {
            avatarUrl = profileOpt.get().getAvatarUrl();
        }

        return ResponseEntity.ok(new AuthUserDto(user.getEmail(), user.getName(), avatarUrl, user.getRoles()));
    }

    @org.springframework.web.bind.annotation.PutMapping("/password")
    public ResponseEntity<String> changePassword(@RequestBody java.util.Map<String, String> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return new ResponseEntity<>("Missing passwords", HttpStatus.BAD_REQUEST);
        }

        authService.changePassword(email, currentPassword, newPassword);
        return ResponseEntity.ok("Password updated successfully");
    }

    @PostMapping("/upgrade")
    public ResponseEntity<String> upgradeToPremium() {
        System.out.println("--- UPGRADE REQUEST RECEIVED ---");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            System.out.println("ERROR: Authentication is NULL");
            return new ResponseEntity<>("Authentication required", HttpStatus.UNAUTHORIZED);
        }
        String email = authentication.getName();
        System.out.println("Upgrading user: " + email);
        try {
            authService.upgradeToPremium(email);
            System.out.println("Upgrade SUCCESS for " + email);
            return ResponseEntity.ok("Successfully upgraded to Premium!");
        } catch (Exception e) {
            System.out.println("Upgrade FAILED for " + email + ": " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>("Upgrade failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/downgrade")
    public ResponseEntity<String> downgradePremium() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return new ResponseEntity<>("Authentication required", HttpStatus.UNAUTHORIZED);
        }
        String email = authentication.getName();
        try {
            authService.downgradePremium(email);
            return ResponseEntity.ok("Successfully downgraded to User!");
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Downgrade failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
