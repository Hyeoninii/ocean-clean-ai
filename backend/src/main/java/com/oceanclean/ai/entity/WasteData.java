package com.oceanclean.ai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "waste_data")
public class WasteData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "file_name", nullable = false)
    private String fileName;
    
    @Column(name = "latitude", nullable = false)
    private Double latitude;
    
    @Column(name = "longitude", nullable = false)
    private Double longitude;
    
    @Column(name = "label", nullable = false)
    private String label;
    
    @Column(name = "weight")
    private Double weight;
    
    @Column(name = "cluster")
    private Integer cluster;
    
    @Column(name = "risk_score", nullable = false)
    private Double riskScore;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "image_path")
    private String imagePath;
    
    // 기본 생성자
    public WasteData() {
        this.createdAt = LocalDateTime.now();
    }
    
    // 생성자
    public WasteData(String fileName, Double latitude, Double longitude, 
                    String label, Double weight, Integer cluster, 
                    Double riskScore, String imagePath) {
        this();
        this.fileName = fileName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.label = label;
        this.weight = weight;
        this.cluster = cluster;
        this.riskScore = riskScore;
        this.imagePath = imagePath;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public Double getLatitude() {
        return latitude;
    }
    
    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }
    
    public Double getLongitude() {
        return longitude;
    }
    
    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
    
    public String getLabel() {
        return label;
    }
    
    public void setLabel(String label) {
        this.label = label;
    }
    
    public Double getWeight() {
        return weight;
    }
    
    public void setWeight(Double weight) {
        this.weight = weight;
    }
    
    public Integer getCluster() {
        return cluster;
    }
    
    public void setCluster(Integer cluster) {
        this.cluster = cluster;
    }
    
    public Double getRiskScore() {
        return riskScore;
    }
    
    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getImagePath() {
        return imagePath;
    }
    
    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }
}
