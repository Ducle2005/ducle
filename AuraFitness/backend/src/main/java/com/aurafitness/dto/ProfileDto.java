package com.aurafitness.dto;

import com.aurafitness.entity.Goal;

public class ProfileDto {
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    
    // New Metrics
    private Double bodyFat;
    private Double muscleMass;
    private Double waterIntake;
    private Integer calorieTarget;
    
    private Goal goal;

    private String avatarUrl;
    private Double targetWeight;
    private Integer workoutDaysPerWeek;
    private String experienceLevel;
    private String preferredWorkoutType;
    private Boolean reminderEnabled;
    private String reminderTime;
    private String reminderDays;
    private String theme;
    private String weightUnit;
    private String heightUnit;

    public ProfileDto() {}

    public ProfileDto(Integer age, String gender, Double height, Double weight, 
                      Double bodyFat, Double muscleMass, Double waterIntake, Integer calorieTarget,
                      Goal goal, String avatarUrl, Double targetWeight, Integer workoutDaysPerWeek,
                      String experienceLevel, String preferredWorkoutType, Boolean reminderEnabled,
                      String reminderTime, String reminderDays, String theme, String weightUnit, String heightUnit) {
        this.age = age;
        this.gender = gender;
        this.height = height;
        this.weight = weight;
        this.bodyFat = bodyFat;
        this.muscleMass = muscleMass;
        this.waterIntake = waterIntake;
        this.calorieTarget = calorieTarget;
        this.goal = goal;
        this.avatarUrl = avatarUrl;
        this.targetWeight = targetWeight;
        this.workoutDaysPerWeek = workoutDaysPerWeek;
        this.experienceLevel = experienceLevel;
        this.preferredWorkoutType = preferredWorkoutType;
        this.reminderEnabled = reminderEnabled;
        this.reminderTime = reminderTime;
        this.reminderDays = reminderDays;
        this.theme = theme;
        this.weightUnit = weightUnit;
        this.heightUnit = heightUnit;
    }

    public static ProfileDtoBuilder builder() {
        return new ProfileDtoBuilder();
    }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
    public Double getBodyFat() { return bodyFat; }
    public void setBodyFat(Double bodyFat) { this.bodyFat = bodyFat; }
    public Double getMuscleMass() { return muscleMass; }
    public void setMuscleMass(Double muscleMass) { this.muscleMass = muscleMass; }
    public Double getWaterIntake() { return waterIntake; }
    public void setWaterIntake(Double waterIntake) { this.waterIntake = waterIntake; }
    public Integer getCalorieTarget() { return calorieTarget; }
    public void setCalorieTarget(Integer calorieTarget) { this.calorieTarget = calorieTarget; }
    public Goal getGoal() { return goal; }
    public void setGoal(Goal goal) { this.goal = goal; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public Double getTargetWeight() { return targetWeight; }
    public void setTargetWeight(Double targetWeight) { this.targetWeight = targetWeight; }
    public Integer getWorkoutDaysPerWeek() { return workoutDaysPerWeek; }
    public void setWorkoutDaysPerWeek(Integer workoutDaysPerWeek) { this.workoutDaysPerWeek = workoutDaysPerWeek; }
    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
    public String getPreferredWorkoutType() { return preferredWorkoutType; }
    public void setPreferredWorkoutType(String preferredWorkoutType) { this.preferredWorkoutType = preferredWorkoutType; }
    public Boolean getReminderEnabled() { return reminderEnabled; }
    public void setReminderEnabled(Boolean reminderEnabled) { this.reminderEnabled = reminderEnabled; }
    public String getReminderTime() { return reminderTime; }
    public void setReminderTime(String reminderTime) { this.reminderTime = reminderTime; }
    public String getReminderDays() { return reminderDays; }
    public void setReminderDays(String reminderDays) { this.reminderDays = reminderDays; }
    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
    public String getWeightUnit() { return weightUnit; }
    public void setWeightUnit(String weightUnit) { this.weightUnit = weightUnit; }
    public String getHeightUnit() { return heightUnit; }
    public void setHeightUnit(String heightUnit) { this.heightUnit = heightUnit; }

    public static class ProfileDtoBuilder {
        private Integer age;
        private String gender;
        private Double height;
        private Double weight;
        private Double bodyFat;
        private Double muscleMass;
        private Double waterIntake;
        private Integer calorieTarget;
        private Goal goal;
        private String avatarUrl;
        private Double targetWeight;
        private Integer workoutDaysPerWeek;
        private String experienceLevel;
        private String preferredWorkoutType;
        private Boolean reminderEnabled;
        private String reminderTime;
        private String reminderDays;
        private String theme;
        private String weightUnit;
        private String heightUnit;

        public ProfileDtoBuilder age(Integer age) { this.age = age; return this; }
        public ProfileDtoBuilder gender(String gender) { this.gender = gender; return this; }
        public ProfileDtoBuilder height(Double height) { this.height = height; return this; }
        public ProfileDtoBuilder weight(Double weight) { this.weight = weight; return this; }
        public ProfileDtoBuilder bodyFat(Double bodyFat) { this.bodyFat = bodyFat; return this; }
        public ProfileDtoBuilder muscleMass(Double muscleMass) { this.muscleMass = muscleMass; return this; }
        public ProfileDtoBuilder waterIntake(Double waterIntake) { this.waterIntake = waterIntake; return this; }
        public ProfileDtoBuilder calorieTarget(Integer calorieTarget) { this.calorieTarget = calorieTarget; return this; }
        public ProfileDtoBuilder goal(Goal goal) { this.goal = goal; return this; }
        public ProfileDtoBuilder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public ProfileDtoBuilder targetWeight(Double targetWeight) { this.targetWeight = targetWeight; return this; }
        public ProfileDtoBuilder workoutDaysPerWeek(Integer workoutDaysPerWeek) { this.workoutDaysPerWeek = workoutDaysPerWeek; return this; }
        public ProfileDtoBuilder experienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; return this; }
        public ProfileDtoBuilder preferredWorkoutType(String preferredWorkoutType) { this.preferredWorkoutType = preferredWorkoutType; return this; }
        public ProfileDtoBuilder reminderEnabled(Boolean reminderEnabled) { this.reminderEnabled = reminderEnabled; return this; }
        public ProfileDtoBuilder reminderTime(String reminderTime) { this.reminderTime = reminderTime; return this; }
        public ProfileDtoBuilder reminderDays(String reminderDays) { this.reminderDays = reminderDays; return this; }
        public ProfileDtoBuilder theme(String theme) { this.theme = theme; return this; }
        public ProfileDtoBuilder weightUnit(String weightUnit) { this.weightUnit = weightUnit; return this; }
        public ProfileDtoBuilder heightUnit(String heightUnit) { this.heightUnit = heightUnit; return this; }
        public ProfileDto build() { 
            return new ProfileDto(age, gender, height, weight, bodyFat, muscleMass, waterIntake, calorieTarget, goal,
                                  avatarUrl, targetWeight, workoutDaysPerWeek, experienceLevel, preferredWorkoutType,
                                  reminderEnabled, reminderTime, reminderDays, theme, weightUnit, heightUnit); 
        }
    }
}
