package com.aurafitness.service;

import com.aurafitness.entity.*;
import com.aurafitness.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class GamificationService {

    private final UserStatsRepository userStatsRepository;
    private final AchievementRepository achievementRepository;
    private final UserRepository userRepository;

    public GamificationService(
            UserStatsRepository userStatsRepository,
            AchievementRepository achievementRepository,
            UserRepository userRepository) {
        this.userStatsRepository = userStatsRepository;
        this.achievementRepository = achievementRepository;
        this.userRepository = userRepository;
    }

    public UserStats getUserStats(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return userStatsRepository.findByUser(user)
                .orElseGet(() -> userStatsRepository.save(new UserStats(user)));
    }

    @Transactional
    public void rewardWorkoutCompletion(User user) {
        UserStats stats = userStatsRepository.findByUser(user)
                .orElseGet(() -> userStatsRepository.save(new UserStats(user)));

        // Reward XP: 50 XP per workout session
        addExperience(stats, 50L);

        // Update Streak
        updateStreak(stats);

        userStatsRepository.save(stats);
    }

    private void addExperience(UserStats stats, Long amount) {
        stats.setExperience(stats.getExperience() + amount);
        
        // Level Up Logic
        while (stats.getExperience() >= stats.getNextLevelExperience()) {
            stats.setLevel(stats.getLevel() + 1);
            // Award Level Achievement
            awardAchievement(stats.getUser(), "Level " + stats.getLevel(), "Reached Level " + stats.getLevel() + "!", "Trophy");
        }
    }

    private void updateStreak(UserStats stats) {
        LocalDate today = LocalDate.now();
        LocalDate lastActivity = stats.getLastActivityDate();

        if (lastActivity == null) {
            stats.setCurrentStreak(1);
        } else if (lastActivity.equals(today.minusDays(1))) {
            stats.setCurrentStreak(stats.getCurrentStreak() + 1);
        } else if (!lastActivity.equals(today)) {
            stats.setCurrentStreak(1);
        }

        if (stats.getCurrentStreak() > stats.getHighestStreak()) {
            stats.setHighestStreak(stats.getCurrentStreak());
        }

        stats.setLastActivityDate(today);

        // Award Streak Achievements
        if (stats.getCurrentStreak() == 7) {
            awardAchievement(stats.getUser(), "7 Day Streak", "You've worked out for 7 days in a row!", "Flame");
        }
    }

    private void awardAchievement(User user, String name, String description, String icon) {
        achievementRepository.save(new Achievement(user, name, description, icon));
    }
}
