package com.aurafitness.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "body_scans")
public class BodyScan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private LocalDateTime scanDate;
    private String imageUrl;
    
    private Double bodyFatPercentage;
    private Double chest;
    private Double waist;
    private Double hips;
    private Double weightAtScan;

    public BodyScan() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getScanDate() { return scanDate; }
    public void setScanDate(LocalDateTime scanDate) { this.scanDate = scanDate; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Double getBodyFatPercentage() { return bodyFatPercentage; }
    public void setBodyFatPercentage(Double bodyFatPercentage) { this.bodyFatPercentage = bodyFatPercentage; }
    public Double getChest() { return chest; }
    public void setChest(Double chest) { this.chest = chest; }
    public Double getWaist() { return waist; }
    public void setWaist(Double waist) { this.waist = waist; }
    public Double getHips() { return hips; }
    public void setHips(Double hips) { this.hips = hips; }
    public Double getWeightAtScan() { return weightAtScan; }
    public void setWeightAtScan(Double weightAtScan) { this.weightAtScan = weightAtScan; }
}
