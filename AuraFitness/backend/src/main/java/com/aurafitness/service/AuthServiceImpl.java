package com.aurafitness.service;

import com.aurafitness.dto.LoginDto;
import com.aurafitness.dto.RegisterDto;
import com.aurafitness.entity.User;
import com.aurafitness.repository.UserRepository;
import com.aurafitness.entity.Profile;
import com.aurafitness.repository.ProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.HashSet;
import java.util.Set;

@Service
public class AuthServiceImpl implements AuthService {

    private AuthenticationManager authenticationManager;
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtTokenProvider jwtTokenProvider;
    private ProfileRepository profileRepository;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                            UserRepository userRepository,
                            PasswordEncoder passwordEncoder,
                            JwtTokenProvider jwtTokenProvider,
                            ProfileRepository profileRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.profileRepository = profileRepository;
    }

    @Override
    public String login(LoginDto loginDto) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    loginDto.getEmail(), loginDto.getPassword()));
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtTokenProvider.generateToken(authentication);

        return token;
    }

    @Override
    public String register(RegisterDto registerDto) {
        // check if email already exists
        if(userRepository.findByEmail(registerDto.getEmail()).isPresent()){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = User.builder()
                .name(registerDto.getName())
                .email(registerDto.getEmail())
                .password(passwordEncoder.encode(registerDto.getPassword()))
                .build();

        Set<String> roles = new HashSet<>();
        roles.add("ROLE_USER");
        user.setRoles(roles);

        userRepository.save(user);

        return "User Registered Successfully!";
    }

    @Override
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public void upgradeToPremium(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Set<String> roles = user.getRoles();
        if (roles == null) roles = new HashSet<>();
        roles.add("ROLE_PREMIUM");
        user.setRoles(roles);
        userRepository.save(user);

        Profile profile = profileRepository.findByUser(user).orElseGet(() -> {
            Profile p = new Profile();
            p.setUser(user);
            return p;
        });
        profile.setPremiumStartDate(java.time.LocalDate.now());
        profileRepository.save(profile);
    }

    @Override
    public void downgradePremium(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Profile profile = profileRepository.findByUser(user).orElse(null);
        if (profile != null && profile.getPremiumStartDate() != null) {
            java.time.LocalDate now = java.time.LocalDate.now();
            if (now.isBefore(profile.getPremiumStartDate().plusDays(7))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn chỉ có thể hủy gói VIP sau 7 ngày kể từ lúc đăng ký.");
            }
        }

        Set<String> roles = user.getRoles();
        if (roles != null) {
            roles.remove("ROLE_PREMIUM");
            user.setRoles(roles);
            userRepository.save(user);
        }
        
        if (profile != null) {
            profile.setPremiumStartDate(null);
            profileRepository.save(profile);
        }
    }
}
