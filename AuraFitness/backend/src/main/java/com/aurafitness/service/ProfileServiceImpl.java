package com.aurafitness.service;

import com.aurafitness.dto.ProfileDto;
import com.aurafitness.entity.Profile;
import com.aurafitness.entity.User;
import com.aurafitness.repository.ProfileRepository;
import com.aurafitness.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ProfileServiceImpl implements ProfileService {

    private ProfileRepository profileRepository;
    private UserRepository userRepository;

    public ProfileServiceImpl(ProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ProfileDto updateProfile(String email, ProfileDto profileDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        Profile profile = profileRepository.findByUser(user)
                .orElse(new Profile());

        profile.setUser(user);
        profile.setAge(profileDto.getAge());
        profile.setGender(profileDto.getGender());
        profile.setHeight(profileDto.getHeight());
        profile.setWeight(profileDto.getWeight());
        profile.setGoal(profileDto.getGoal());
        
        // New Metrics
        profile.setBodyFat(profileDto.getBodyFat());
        profile.setMuscleMass(profileDto.getMuscleMass());
        profile.setWaterIntake(profileDto.getWaterIntake());
        profile.setCalorieTarget(profileDto.getCalorieTarget());

        profile.setAvatarUrl(profileDto.getAvatarUrl());
        profile.setTargetWeight(profileDto.getTargetWeight());
        profile.setWorkoutDaysPerWeek(profileDto.getWorkoutDaysPerWeek());
        profile.setExperienceLevel(profileDto.getExperienceLevel());
        profile.setPreferredWorkoutType(profileDto.getPreferredWorkoutType());
        profile.setReminderEnabled(profileDto.getReminderEnabled());
        profile.setReminderTime(profileDto.getReminderTime());
        profile.setReminderDays(profileDto.getReminderDays());
        profile.setTheme(profileDto.getTheme());
        profile.setWeightUnit(profileDto.getWeightUnit());
        profile.setHeightUnit(profileDto.getHeightUnit());

        Profile savedProfile = profileRepository.save(profile);
        return mapToDto(savedProfile);
    }

    @Override
    public ProfileDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // If no profile exists, create a default one for the new user
        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> {
                    Profile p = new Profile();
                    p.setUser(user);
                    return profileRepository.save(p);
                });

        return mapToDto(profile);
    }

    private ProfileDto mapToDto(Profile profile) {
        return ProfileDto.builder()
                .age(profile.getAge())
                .gender(profile.getGender())
                .height(profile.getHeight())
                .weight(profile.getWeight())
                .goal(profile.getGoal())
                .bodyFat(profile.getBodyFat())
                .muscleMass(profile.getMuscleMass())
                .waterIntake(profile.getWaterIntake())
                .calorieTarget(profile.getCalorieTarget())
                .avatarUrl(profile.getAvatarUrl())
                .targetWeight(profile.getTargetWeight())
                .workoutDaysPerWeek(profile.getWorkoutDaysPerWeek())
                .experienceLevel(profile.getExperienceLevel())
                .preferredWorkoutType(profile.getPreferredWorkoutType())
                .reminderEnabled(profile.getReminderEnabled())
                .reminderTime(profile.getReminderTime())
                .reminderDays(profile.getReminderDays())
                .theme(profile.getTheme())
                .weightUnit(profile.getWeightUnit())
                .heightUnit(profile.getHeightUnit())
                .build();
    }
}
