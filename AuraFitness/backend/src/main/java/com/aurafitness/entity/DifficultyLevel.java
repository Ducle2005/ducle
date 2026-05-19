package com.aurafitness.entity;

public enum DifficultyLevel {
    BEGINNER,
    INTERMEDIATE,
    ADVANCED;

    public static DifficultyLevel fromValue(String value) {
        return DifficultyLevel.valueOf(value.trim().replace("-", "_").replace(" ", "_").toUpperCase());
    }
}
