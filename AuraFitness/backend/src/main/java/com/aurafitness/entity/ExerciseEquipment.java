package com.aurafitness.entity;

public enum ExerciseEquipment {
    DUMBBELL,
    BARBELL,
    BODYWEIGHT,
    MACHINE,
    CABLE,
    KETTLEBELL,
    RESISTANCE_BAND,
    MEDICINE_BALL;

    public static ExerciseEquipment fromValue(String value) {
        return ExerciseEquipment.valueOf(value.trim().replace("-", "_").replace(" ", "_").toUpperCase());
    }
}
