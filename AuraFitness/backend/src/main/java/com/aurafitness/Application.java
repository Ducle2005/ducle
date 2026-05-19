package com.aurafitness;

import com.aurafitness.entity.*;
import com.aurafitness.repository.*;
import com.aurafitness.service.WorkoutService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.stream.Stream;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        try (Stream<String> stream = Files.lines(Paths.get(".env"))) {
            stream.forEach(line -> {
                if (line.contains("=") && !line.trim().startsWith("#")) {
                    String[] parts = line.split("=", 2);
                    System.setProperty(parts[0].trim(), parts[1].trim());
                }
            });
        } catch (Exception ignored) {}
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public CommandLineRunner runner(
            WorkoutService workoutService, 
            UserRepository userRepository,
            WeightLogRepository weightLogRepository,
            WorkoutSessionRepository sessionRepository,
            WorkoutPlanRepository planRepository,
            UserStatsRepository userStatsRepository,
            FoodLogRepository foodLogRepository,
            AchievementRepository achievementRepository,
            JdbcTemplate jdbcTemplate) {
        return args -> {
            migrateLegacyExerciseSchema(jdbcTemplate);
            workoutService.seedExercises();
            
            // Seed a mock user history if dylan@aura.com exists
            userRepository.findByEmail("dylan@aura.com").ifPresent(user -> {
                if (weightLogRepository.count() == 0) {
                    LocalDate today = LocalDate.now();
                    for (int i = 14; i >= 0; i--) {
                        double weight = 82.5 - (i * 0.1) + (Math.random() * 0.2); // Downtrend with noise
                        weightLogRepository.save(new WeightLog(user, weight, today.minusDays(i)));
                    }
                }

                if (userStatsRepository.count() == 0) {
                    UserStats stats = new UserStats(user);
                    stats.setLevel(5);
                    stats.setExperience(1250L);
                    stats.setCurrentStreak(4);
                    stats.setHighestStreak(12);
                    stats.setLastActivityDate(LocalDate.now());
                    userStatsRepository.save(stats);
                }

                if (foodLogRepository.count() == 0) {
                    LocalDate today = LocalDate.now();
                    foodLogRepository.save(new FoodLog(user, "Oatmeal with Blueberries", 350, 12.0, 55.0, 7.0, "BREAKFAST", today));
                    foodLogRepository.save(new FoodLog(user, "Grilled Chicken & Rice", 650, 45.0, 70.0, 15.0, "LUNCH", today));
                    foodLogRepository.save(new FoodLog(user, "Protein Shake", 180, 25.0, 5.0, 3.0, "SNACK", today));
                }

                if (achievementRepository.count() == 0) {
                    achievementRepository.save(new Achievement(user, "Founder", "One of the first warriors to join Aura Fitness.", "Sparkles"));
                    achievementRepository.save(new Achievement(user, "Consistency King", "Achieved a 7-day workout streak.", "Flame"));
                }
            });
        };
    }

    private void migrateLegacyExerciseSchema(JdbcTemplate jdbcTemplate) {
        jdbcTemplate.execute("ALTER TABLE IF EXISTS exercises ADD COLUMN IF NOT EXISTS muscle_group VARCHAR(50)");
        jdbcTemplate.execute("ALTER TABLE IF EXISTS exercises ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50)");
        jdbcTemplate.execute("ALTER TABLE IF EXISTS exercises ADD COLUMN IF NOT EXISTS equipment VARCHAR(50)");
        jdbcTemplate.execute("ALTER TABLE IF EXISTS exercises ADD COLUMN IF NOT EXISTS instructions CLOB");
        jdbcTemplate.execute("ALTER TABLE IF EXISTS exercises ADD COLUMN IF NOT EXISTS image_url VARCHAR(1000)");
        jdbcTemplate.execute("ALTER TABLE IF EXISTS exercises ADD COLUMN IF NOT EXISTS video_url VARCHAR(1000)");

        jdbcTemplate.execute("UPDATE exercises SET muscle_group = 'FULL_BODY' WHERE muscle_group IS NULL");
        jdbcTemplate.execute("UPDATE exercises SET difficulty = 'BEGINNER' WHERE difficulty IS NULL");
        jdbcTemplate.execute("UPDATE exercises SET equipment = 'BODYWEIGHT' WHERE equipment IS NULL");
        jdbcTemplate.execute("UPDATE exercises SET instructions = 'Follow the standard setup and controlled execution.' WHERE instructions IS NULL");
    }
}
