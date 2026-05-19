package com.aurafitness.repository;

import com.aurafitness.entity.WeightLog;
import com.aurafitness.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeightLogRepository extends JpaRepository<WeightLog, Long> {
    List<WeightLog> findByUserOrderByDateAsc(User user);
    Optional<WeightLog> findByUserAndDate(User user, LocalDate date);
}
