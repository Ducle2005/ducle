package com.aurafitness.repository;

import com.aurafitness.entity.BodyScan;
import com.aurafitness.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BodyScanRepository extends JpaRepository<BodyScan, Long> {
    List<BodyScan> findByUserOrderByScanDateDesc(User user);
}
