package com.aurafitness.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "user_profiles")
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer age;
    private String gender; // Male, Female, Other
    private Double height;
    private Double weight;
    
    // New Health Metrics
    private Double bodyFat;      // Percentage (%)
    private Double muscleMass;   // kg
    private Double waterIntake;  // Liters (L)
    private Integer calorieTarget; // kcal
    private Double hrv;          // ms

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

    @Enumerated(EnumType.STRING)
    private Goal goal;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public Profile() {}

    public Profile(Long id, Integer age, String gender, Double height, Double weight, 
                   Double bodyFat, Double muscleMass, Double waterIntake, Integer calorieTarget,
                   Goal goal, User user, String avatarUrl, Double targetWeight, Integer workoutDaysPerWeek,
                   String experienceLevel, String preferredWorkoutType, Boolean reminderEnabled,
                   String reminderTime, String reminderDays, String theme, String weightUnit, String heightUnit, Double hrv) {
        this.id = id;
        this.age = age;
        this.gender = gender;
        this.height = height;
        this.weight = weight;
        this.bodyFat = bodyFat;
        this.muscleMass = muscleMass;
        this.waterIntake = waterIntake;
        this.calorieTarget = calorieTarget;
        this.goal = goal;
        this.user = user;
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
        this.hrv = hrv;
    }

    public static ProfileBuilder builder() {
        return new ProfileBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public Double getHrv() { return hrv; }
    public void setHrv(Double hrv) { this.hrv = hrv; }
    public Goal getGoal() { return goal; }
    public void setGoal(Goal goal) { this.goal = goal; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
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

    private Integer aiChatCount = 0;
    private java.time.LocalDate lastAiChatDate;

    public Integer getAiChatCount() { return aiChatCount; }
    public void setAiChatCount(Integer aiChatCount) { this.aiChatCount = aiChatCount; }
    public java.time.LocalDate getLastAiChatDate() { return lastAiChatDate; }
    public void setLastAiChatDate(java.time.LocalDate lastAiChatDate) { this.lastAiChatDate = lastAiChatDate; }

    public static class ProfileBuilder {
        private Long id;
        private Integer age;
        private String gender;
        private Double height;
        private Double weight;
        private Double bodyFat;
        private Double muscleMass;
        private Double waterIntake;
        private Integer calorieTarget;
        private Goal goal;
        private User user;
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
        private Double hrv;

        public ProfileBuilder id(Long id) { this.id = id; return this; }
        public ProfileBuilder age(Integer age) { this.age = age; return this; }
        public ProfileBuilder gender(String gender) { this.gender = gender; return this; }
        public ProfileBuilder height(Double height) { this.height = height; return this; }
        public ProfileBuilder weight(Double weight) { this.weight = weight; return this; }
        public ProfileBuilder bodyFat(Double bodyFat) { this.bodyFat = bodyFat; return this; }
        public ProfileBuilder muscleMass(Double muscleMass) { this.muscleMass = muscleMass; return this; }
        public ProfileBuilder waterIntake(Double waterIntake) { this.waterIntake = waterIntake; return this; }
        public ProfileBuilder calorieTarget(Integer calorieTarget) { this.calorieTarget = calorieTarget; return this; }
        public ProfileBuilder goal(Goal goal) { this.goal = goal; return this; }
        public ProfileBuilder user(User user) { this.user = user; return this; }
        public ProfileBuilder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public ProfileBuilder targetWeight(Double targetWeight) { this.targetWeight = targetWeight; return this; }
        public ProfileBuilder workoutDaysPerWeek(Integer workoutDaysPerWeek) { this.workoutDaysPerWeek = workoutDaysPerWeek; return this; }
        public ProfileBuilder experienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; return this; }
        public ProfileBuilder preferredWorkoutType(String preferredWorkoutType) { this.preferredWorkoutType = preferredWorkoutType; return this; }
        public ProfileBuilder reminderEnabled(Boolean reminderEnabled) { this.reminderEnabled = reminderEnabled; return this; }
        public ProfileBuilder reminderTime(String reminderTime) { this.reminderTime = reminderTime; return this; }
        public ProfileBuilder reminderDays(String reminderDays) { this.reminderDays = reminderDays; return this; }
        public ProfileBuilder theme(String theme) { this.theme = theme; return this; }
        public ProfileBuilder weightUnit(String weightUnit) { this.weightUnit = weightUnit; return this; }
        public ProfileBuilder heightUnit(String heightUnit) { this.heightUnit = heightUnit; return this; }
        public ProfileBuilder hrv(Double hrv) { this.hrv = hrv; return this; }
        public Profile build() { 
            return new Profile(id, age, gender, height, weight, bodyFat, muscleMass, waterIntake, calorieTarget, goal, user,
                               avatarUrl, targetWeight, workoutDaysPerWeek, experienceLevel, preferredWorkoutType,
                               reminderEnabled, reminderTime, reminderDays, theme, weightUnit, heightUnit, hrv); 
        }
    }
}
