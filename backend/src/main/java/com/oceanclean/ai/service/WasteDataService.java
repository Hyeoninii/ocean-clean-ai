package com.oceanclean.ai.service;

import com.oceanclean.ai.dto.WasteDataDto;
import com.oceanclean.ai.entity.WasteData;
import com.oceanclean.ai.repository.WasteDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WasteDataService {
    
    @Autowired
    private WasteDataRepository wasteDataRepository;
    
    private static final String UPLOAD_DIR = "data/images/";
    private static final String CSV_DIR = "data/csv/";
    
    public List<WasteDataDto> getAllWasteData() {
        return wasteDataRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public Page<WasteDataDto> getWasteDataWithPagination(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return wasteDataRepository.findAll(pageable)
                .map(this::convertToDto);
    }
    
    public List<WasteDataDto> getWasteDataByLabel(String label) {
        return wasteDataRepository.findByLabel(label).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<WasteDataDto> getWasteDataByRiskLevel(String riskLevel) {
        List<WasteData> data;
        switch (riskLevel) {
            case "high":
                data = wasteDataRepository.findByRiskScoreGreaterThanEqual(3.5);
                break;
            case "medium":
                data = wasteDataRepository.findByRiskScoreBetween(3.0, 3.5);
                break;
            case "low":
                data = wasteDataRepository.findByRiskScoreBetween(0.0, 3.0);
                break;
            default:
                data = wasteDataRepository.findAll();
        }
        return data.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<WasteDataDto> getWasteDataByLabelAndRisk(String label, String riskLevel) {
        List<WasteData> data;
        switch (riskLevel) {
            case "high":
                data = wasteDataRepository.findByLabelAndMinRisk(label, 3.5);
                break;
            case "medium":
                data = wasteDataRepository.findByLabel(label).stream()
                        .filter(w -> w.getRiskScore() >= 3.0 && w.getRiskScore() < 3.5)
                        .collect(Collectors.toList());
                break;
            case "low":
                data = wasteDataRepository.findByLabel(label).stream()
                        .filter(w -> w.getRiskScore() < 3.0)
                        .collect(Collectors.toList());
                break;
            default:
                data = wasteDataRepository.findByLabel(label);
        }
        return data.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<String> getDistinctLabels() {
        return wasteDataRepository.findDistinctLabels();
    }
    
    public WasteDataDto saveWasteData(WasteDataDto wasteDataDto) {
        WasteData wasteData = convertToEntity(wasteDataDto);
        WasteData savedData = wasteDataRepository.save(wasteData);
        return convertToDto(savedData);
    }
    
    public String saveUploadedFile(MultipartFile file) throws IOException {
        // 파일 저장 디렉토리 생성
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // 파일명 생성 (타임스탬프 포함)
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = "upload_" + timestamp + extension;
        
        // 파일 저장
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);
        
        return filename;
    }
    
    public WasteDataDto processUploadedImage(String filename, String detectedLabel, Double riskScore) {
        // 위도, 경도는 임시로 설정 (실제로는 GPS 데이터나 사용자 입력을 받아야 함)
        Double latitude = 35.0 + Math.random() * 0.5; // 부산 근해
        Double longitude = 129.0 + Math.random() * 0.5;
        
        WasteDataDto wasteDataDto = new WasteDataDto();
        wasteDataDto.setFileName(filename);
        wasteDataDto.setLatitude(latitude);
        wasteDataDto.setLongitude(longitude);
        wasteDataDto.setLabel(detectedLabel);
        wasteDataDto.setWeight(3.0); // 기본값
        wasteDataDto.setCluster(1); // 기본값
        wasteDataDto.setRiskScore(riskScore);
        wasteDataDto.setImagePath(UPLOAD_DIR + filename);
        wasteDataDto.setCreatedAt(LocalDateTime.now());
        
        return saveWasteData(wasteDataDto);
    }
    
    public Double getAverageRiskScore() {
        return wasteDataRepository.findAverageRiskScore();
    }
    
    public Double getMaxRiskScore() {
        return wasteDataRepository.findMaxRiskScore();
    }
    
    public List<Object[]> getLabelCounts() {
        return wasteDataRepository.findLabelCounts();
    }
    
    /**
     * 기존 데이터베이스의 모든 위험도 점수를 가져옵니다.
     * 
     * @return 위험도 점수 리스트
     */
    public List<Double> getAllRiskScores() {
        return wasteDataRepository.findAll().stream()
                .map(WasteData::getRiskScore)
                .collect(Collectors.toList());
    }
    
    private WasteDataDto convertToDto(WasteData wasteData) {
        return new WasteDataDto(
                wasteData.getId(),
                wasteData.getFileName(),
                wasteData.getLatitude(),
                wasteData.getLongitude(),
                wasteData.getLabel(),
                wasteData.getWeight(),
                wasteData.getCluster(),
                wasteData.getRiskScore(),
                wasteData.getImagePath(),
                wasteData.getCreatedAt()
        );
    }
    
    private WasteData convertToEntity(WasteDataDto wasteDataDto) {
        WasteData wasteData = new WasteData();
        wasteData.setId(wasteDataDto.getId());
        wasteData.setFileName(wasteDataDto.getFileName());
        wasteData.setLatitude(wasteDataDto.getLatitude());
        wasteData.setLongitude(wasteDataDto.getLongitude());
        wasteData.setLabel(wasteDataDto.getLabel());
        wasteData.setWeight(wasteDataDto.getWeight());
        wasteData.setCluster(wasteDataDto.getCluster());
        wasteData.setRiskScore(wasteDataDto.getRiskScore());
        wasteData.setImagePath(wasteDataDto.getImagePath());
        wasteData.setCreatedAt(wasteDataDto.getCreatedAt());
        return wasteData;
    }
}
