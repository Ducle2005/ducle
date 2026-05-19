package com.aurafitness.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "workout_sessions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WorkoutSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_plan_id")
    private WorkoutPlan workoutPlan;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    // Status can be: IN_PROGRESS, COMPLETED, CANCELLED
    private String status;
    
    // VIP Heart Rate Logic
    private Integer avgHeartRate;
    private Integer maxHeartRate;
    private Integer recoveryScore; // BPM reduction in 60s
    private Double hrv; // Heart Rate Variability

    @OneToMany(mappedBy = "workoutSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutSet> workoutSets = new ArrayList<>();

    public WorkoutSession() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public WorkoutPlan getWorkoutPlan() { return workoutPlan; }
    public void setWorkoutPlan(WorkoutPlan workoutPlan) { this.workoutPlan = workoutPlan; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<WorkoutSet> getWorkoutSets() { return workoutSets; }
    public void setWorkoutSets(List<WorkoutSet> workoutSets) { this.workoutSets = workoutSets; }

    public Integer getAvgHeartRate() { return avgHeartRate; }
    public void setAvgHeartRate(Integer avgHeartRate) { this.avgHeartRate = avgHeartRate; }
    public Integer getMaxHeartRate() { return maxHeartRate; }
    public void setMaxHeartRate(Integer maxHeartRate) { this.maxHeartRate = maxHeartRate; }
    public Integer getRecoveryScore() { return recoveryScore; }
    public void setRecoveryScore(Integer recoveryScore) { this.recoveryScore = recoveryScore; }
    public Double getHrv() { return hrv; }
    public void setHrv(Double hrv) { this.hrv = hrv; }
}
