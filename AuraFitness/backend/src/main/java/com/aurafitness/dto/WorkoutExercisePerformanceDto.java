package com.aurafitness.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class WorkoutExercisePerformanceDto {

    private Long exerciseId;
    private String exerciseName;
    private double bestWeight;
    private int bestReps;
    private double bestOneRepMax;
    private double bestVolume;
    private String trend;
    private String recommendation;
    private List<SetSnapshot> recentSets = new ArrayList<>();

    public Long getExerciseId() { return exerciseId; }
    public void setExerciseId(Long exerciseId) { this.exerciseId = exerciseId; }
    public String getExerciseName() { return exerciseName; }
    public void setExerciseName(String exerciseName) { this.exerciseName = exerciseName; }
    public double getBestWeight() { return bestWeight; }
    public void setBestWeight(double bestWeight) { this.bestWeight = bestWeight; }
    public int getBestReps() { return bestReps; }
    public void setBestReps(int bestReps) { this.bestReps = bestReps; }
    public double getBestOneRepMax() { return bestOneRepMax; }
    public void setBestOneRepMax(double bestOneRepMax) { this.bestOneRepMax = bestOneRepMax; }
    public double getBestVolume() { return bestVolume; }
    public void setBestVolume(double bestVolume) { this.bestVolume = bestVolume; }
    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }
    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    public List<SetSnapshot> getRecentSets() { return recentSets; }
    public void setRecentSets(List<SetSnapshot> recentSets) { this.recentSets = recentSets; }

    public static class SetSnapshot {
        private LocalDateTime startTime;
        private String planName;
        private Integer setNumber;
        private Double weight;
        private Integer reps;
        private String setType;
        private Double rpe;
        private Integer rir;
        private String notes;
        private double volume;
        private double oneRepMax;

        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
        public String getPlanName() { return planName; }
        public void setPlanName(String planName) { this.planName = planName; }
        public Integer getSetNumber() { return setNumber; }
        public void setSetNumber(Integer setNumber) { this.setNumber = setNumber; }
        public Double getWeight() { return weight; }
        public void setWeight(Double weight) { this.weight = weight; }
        public Integer getReps() { return reps; }
        public void setReps(Integer reps) { this.reps = reps; }
        public String getSetType() { return setType; }
        public void setSetType(String setType) { this.setType = setType; }
        public Double getRpe() { return rpe; }
        public void setRpe(Double rpe) { this.rpe = rpe; }
        public Integer getRir() { return rir; }
        public void setRir(Integer rir) { this.rir = rir; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public double getVolume() { return volume; }
        public void setVolume(double volume) { this.volume = volume; }
        public double getOneRepMax() { return oneRepMax; }
        public void setOneRepMax(double oneRepMax) { this.oneRepMax = oneRepMax; }
    }
}
