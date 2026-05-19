package com.aurafitness.service;

import com.aurafitness.dto.ProfileDto;

public interface ProfileService {
    ProfileDto updateProfile(String email, ProfileDto profileDto);
    ProfileDto getProfile(String email);
}
