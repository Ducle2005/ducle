package com.aurafitness.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "workout_sets")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WorkoutSet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_session_id", nullable = false)
    @JsonIgnore
    private WorkoutSession workoutSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_exercise_id", nullable = false)
    private WorkoutExercise workoutExercise;

    private Integer setNumber;
    private Double weight;
    private Integer reps;
    private String setType;
    private Double rpe;
    private Integer rir;
    private Integer restSeconds;
    private String tempo;
    private String supersetGroup;

    @Column(length = 1000)
    private String notes;
    
    // Whether the set was completed or failed
    private Boolean completed;

    public WorkoutSet() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public WorkoutSession getWorkoutSession() { return workoutSession; }
    public void setWorkoutSession(WorkoutSession workoutSession) { this.workoutSession = workoutSession; }
    public WorkoutExercise getWorkoutExercise() { return workoutExercise; }
    public void setWorkoutExercise(WorkoutExercise workoutExercise) { this.workoutExercise = workoutExercise; }
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
    public Integer getRestSeconds() { return restSeconds; }
    public void setRestSeconds(Integer restSeconds) { this.restSeconds = restSeconds; }
    public String getTempo() { return tempo; }
    public void setTempo(String tempo) { this.tempo = tempo; }
    public String getSupersetGroup() { return supersetGroup; }
    public void setSupersetGroup(String supersetGroup) { this.supersetGroup = supersetGroup; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }

    public Double getVolume() {
        if (weight == null || reps == null) return 0.0;
        return weight * reps;
    }

    public Double getPredictedOneRepMax() {
        if (weight == null || reps == null || reps == 0) return 0.0;
        if (reps == 1) return weight;
        // Epley Formula: 1RM = W * (1 + r/30)
        return weight * (1 + (double)reps / 30);
    }
}
