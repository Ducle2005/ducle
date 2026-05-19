package com.aurafitness.repository;

import com.aurafitness.entity.WorkoutSession;
import com.aurafitness.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {
    List<WorkoutSession> findByUserOrderByStartTimeDesc(User user);
    List<com.aurafitness.entity.WorkoutSession> findTop10ByUserIdOrderByStartTimeDesc(Long userId);
}
