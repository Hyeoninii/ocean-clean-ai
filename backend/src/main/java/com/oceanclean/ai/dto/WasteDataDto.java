package com.oceanclean.ai.dto;

import java.time.LocalDateTime;

public class WasteDataDto {
    
    private Long id;
    private String fileName;
    private Double latitude;
    private Double longitude;
    private String label;
    private String labelKorean;
    private Double weight;
    private Integer cluster;
    private Double riskScore;
    private String riskLevel;
    private String locationName;
    private LocalDateTime createdAt;
    private String imagePath;
    
    // 기본 생성자
    public WasteDataDto() {}
    
    // 생성자
    public WasteDataDto(Long id, String fileName, Double latitude, Double longitude, 
                       String label, Double weight, Integer cluster, 
                       Double riskScore, String imagePath, LocalDateTime createdAt) {
        this.id = id;
        this.fileName = fileName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.label = label;
        this.labelKorean = getKoreanLabel(label);
        this.weight = weight;
        this.cluster = cluster;
        this.riskScore = riskScore;
        this.riskLevel = getRiskLevel(riskScore);
        this.locationName = getLocationName(latitude, longitude);
        this.imagePath = imagePath;
        this.createdAt = createdAt;
    }
    
    private String getKoreanLabel(String label) {
        switch (label) {
            case "Fish_net": return "어망";
            case "Fish_trap": return "어구";
            case "Glass": return "유리";
            case "Metal": return "금속";
            case "Plastic": return "플라스틱";
            case "Rope": return "로프";
            case "Rubber_etc": return "고무류";
            case "Rubber_tire": return "고무타이어";
            case "Wood": return "목재";
            case "PET_Bottle": return "PET 병";
            case "Bottle": return "병";
            case "Can": return "캔";
            case "Bag": return "비닐봉지";
            case "Container": return "컨테이너";
            default: return "기타";
        }
    }
    
    private String getRiskLevel(Double riskScore) {
        if (riskScore >= 4.0) {
            return "🔴 매우 높음";
        } else if (riskScore >= 3.5) {
            return "🟠 높음";
        } else if (riskScore >= 3.0) {
            return "🟡 보통";
        } else {
            return "🟢 낮음";
        }
    }
    
    private String getLocationName(Double lat, Double lon) {
        // 제주 지역
        if (33.2 <= lat && lat <= 33.3 && 126.2 <= lon && lon <= 126.7) {
            if (126.2 <= lon && lon <= 126.4) {
                return "제주 서귀포";
            } else if (126.4 <= lon && lon <= 126.5) {
                return "제주 제주시";
            } else if (126.6 <= lon && lon <= 126.7) {
                return "제주 성산";
            } else {
                return "제주 해역";
            }
        }
        
        // 전남 지역
        if (34.7 <= lat && lat <= 34.8 && 127.6 <= lon && lon <= 128.1) {
            if (127.6 <= lon && lon <= 127.8) {
                return "전남 여수";
            } else if (127.8 <= lon && lon <= 128.1) {
                return "전남 순천";
            } else {
                return "전남 해역";
            }
        }
        
        if (34.8 <= lat && lat <= 35.0 && 128.0 <= lon && lon <= 128.5) {
            if (128.0 <= lon && lon <= 128.2) {
                return "전남 여수";
            } else if (128.2 <= lon && lon <= 128.4) {
                return "전남 통영";
            } else if (128.4 <= lon && lon <= 128.5) {
                return "경남 거제";
            } else {
                return "남해 해역";
            }
        }
        
        // 부산 지역
        if (35.0 <= lat && lat <= 35.2 && 128.9 <= lon && lon <= 129.2) {
            if (129.0 <= lon && lon <= 129.1) {
                return "부산 광안리";
            } else if (129.1 <= lon && lon <= 129.2) {
                return "부산 해운대";
            } else {
                return "부산 해역";
            }
        }
        
        if (35.3 <= lat && lat <= 35.4 && 129.2 <= lon && lon <= 129.3) {
            return "부산 기장";
        }
        
        // 울산 지역
        if (35.5 <= lat && lat <= 35.6 && 129.4 <= lon && lon <= 129.5) {
            return "울산 울주";
        }
        
        // 강원 지역
        if (37.0 <= lat && lat <= 37.1 && 129.4 <= lon && lon <= 129.5) {
            return "강원 동해";
        }
        
        // 충남 지역
        if (36.7 <= lat && lat <= 36.8 && 126.1 <= lon && lon <= 126.2) {
            return "충남 태안";
        }
        
        // 전북 지역
        if (34.7 <= lat && lat <= 34.8 && 126.3 <= lon && lon <= 126.4) {
            return "전북 군산";
        }
        
        return "기타 해역";
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
    
    public String getLabelKorean() {
        return labelKorean;
    }
    
    public void setLabelKorean(String labelKorean) {
        this.labelKorean = labelKorean;
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
    
    public String getRiskLevel() {
        return riskLevel;
    }
    
    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }
    
    public String getLocationName() {
        return locationName;
    }
    
    public void setLocationName(String locationName) {
        this.locationName = locationName;
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
