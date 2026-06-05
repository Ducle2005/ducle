package com.aurafitness.service;

import com.aurafitness.dto.LoginDto;
import com.aurafitness.dto.RegisterDto;

public interface AuthService {
    String login(LoginDto loginDto);
    String register(RegisterDto registerDto);
    void changePassword(String email, String currentPassword, String newPassword);
    void upgradeToPremium(String email);
    void downgradePremium(String email);
}
