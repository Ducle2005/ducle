package com.aurafitness.entity;

public enum MuscleGroup {
    CHEST,
    BACK,
    LEGS,
    SHOULDERS,
    ARMS,
    CORE,
    GLUTES,
    FULL_BODY,
    CARDIO;

    public static MuscleGroup fromValue(String value) {
        return MuscleGroup.valueOf(value.trim().replace("-", "_").replace(" ", "_").toUpperCase());
    }
}
