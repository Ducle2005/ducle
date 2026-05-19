package com.aurafitness.controller;

import com.aurafitness.entity.Profile;
import com.aurafitness.entity.User;
import com.aurafitness.repository.ProfileRepository;
import com.aurafitness.repository.UserRepository;
import com.aurafitness.service.FileUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final FileUploadService fileUploadService;

    public UserController(UserRepository userRepository, 
                          ProfileRepository profileRepository, 
                          FileUploadService fileUploadService) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.fileUploadService = fileUploadService;
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateName(@RequestBody Map<String, String> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
                
        if (request.containsKey("name")) {
            user.setName(request.get("name"));
            userRepository.save(user);
        }
        
        return ResponseEntity.ok(Map.of("message", "Name updated successfully"));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        String fileName = fileUploadService.storeFile(file);

        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(fileName)
                .toUriString();

        Profile profile = profileRepository.findByUser(user).orElse(new Profile());
        profile.setUser(user);
        profile.setAvatarUrl(fileDownloadUri);
        profileRepository.save(profile);

        return ResponseEntity.ok(Map.of("avatarUrl", fileDownloadUri));
    }
}
