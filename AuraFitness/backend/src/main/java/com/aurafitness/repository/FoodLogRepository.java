package com.aurafitness.repository;

import com.aurafitness.entity.FoodLog;
import com.aurafitness.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FoodLogRepository extends JpaRepository<FoodLog, Long> {
    List<FoodLog> findByUserAndDate(User user, LocalDate date);
}
