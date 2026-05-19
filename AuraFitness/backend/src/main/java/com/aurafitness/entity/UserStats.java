package com.aurafitness.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_stats")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UserStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private Integer level = 1;
    private Long experience = 0L;
    private Integer currentStreak = 0;
    private Integer highestStreak = 0;
    private LocalDate lastActivityDate;

    public UserStats() {}

    public UserStats(User user) {
        this.user = user;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }
    public Long getExperience() { return experience; }
    public void setExperience(Long experience) { this.experience = experience; }
    public Integer getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }
    public Integer getHighestStreak() { return highestStreak; }
    public void setHighestStreak(Integer highestStreak) { this.highestStreak = highestStreak; }
    public LocalDate getLastActivityDate() { return lastActivityDate; }
    public void setLastActivityDate(LocalDate lastActivityDate) { this.lastActivityDate = lastActivityDate; }

    // Helper to calculate XP needed for next level: 100 * level^1.5
    public Long getNextLevelExperience() {
        return (long)(100 * Math.pow(level, 1.5));
    }
}
