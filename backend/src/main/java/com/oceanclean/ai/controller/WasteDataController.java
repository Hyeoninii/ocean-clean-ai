package com.oceanclean.ai.controller;

import com.oceanclean.ai.dto.WasteDataDto;
import com.oceanclean.ai.service.WasteDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/waste-data")
@CrossOrigin(origins = "http://localhost:3000")
public class WasteDataController {
    
    @Autowired
    private WasteDataService wasteDataService;
    
    @GetMapping
    public ResponseEntity<List<WasteDataDto>> getAllWasteData() {
        List<WasteDataDto> data = wasteDataService.getAllWasteData();
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/page")
    public ResponseEntity<Page<WasteDataDto>> getWasteDataWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<WasteDataDto> data = wasteDataService.getWasteDataWithPagination(page, size);
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/filter")
    public ResponseEntity<List<WasteDataDto>> getFilteredWasteData(
            @RequestParam(required = false) String label,
            @RequestParam(required = false) String riskLevel) {
        
        List<WasteDataDto> data;
        
        if (label != null && !label.equals("전체") && riskLevel != null && !riskLevel.equals("전체")) {
            data = wasteDataService.getWasteDataByLabelAndRisk(label, riskLevel);
        } else if (label != null && !label.equals("전체")) {
            data = wasteDataService.getWasteDataByLabel(label);
        } else if (riskLevel != null && !riskLevel.equals("전체")) {
            data = wasteDataService.getWasteDataByRiskLevel(riskLevel);
        } else {
            data = wasteDataService.getAllWasteData();
        }
        
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/labels")
    public ResponseEntity<List<String>> getDistinctLabels() {
        List<String> labels = wasteDataService.getDistinctLabels();
        return ResponseEntity.ok(labels);
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRiskScore", wasteDataService.getAverageRiskScore());
        stats.put("maxRiskScore", wasteDataService.getMaxRiskScore());
        stats.put("labelCounts", wasteDataService.getLabelCounts());
        return ResponseEntity.ok(stats);
    }
    
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadImage(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 파일 저장
            String filename = wasteDataService.saveUploadedFile(file);
            
            // YOLO 분석 시뮬레이션 (실제로는 YOLO 모델을 호출해야 함)
            String detectedLabel = simulateYOLOAnalysis();
            Double riskScore = calculateRiskScore(detectedLabel);
            
            // 데이터베이스에 저장
            WasteDataDto savedData = wasteDataService.processUploadedImage(filename, detectedLabel, riskScore);
            
            response.put("success", true);
            response.put("filename", filename);
            response.put("detectedLabel", detectedLabel);
            response.put("riskScore", riskScore);
            response.put("data", savedData);
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            response.put("success", false);
            response.put("error", "파일 저장 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "분석 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    private String simulateYOLOAnalysis() {
        // 실제로는 YOLO 모델을 호출해야 함
        String[] labels = {"Fish_net", "Fish_trap", "Glass", "Metal", "Plastic", "Rope", "Wood"};
        return labels[(int) (Math.random() * labels.length)];
    }
    
    private Double calculateRiskScore(String label) {
        // 라벨에 따른 위험도 점수 계산
        Map<String, Double> riskScores = new HashMap<>();
        riskScores.put("Fish_net", 4.5);
        riskScores.put("Fish_trap", 3.0);
        riskScores.put("Glass", 3.8);
        riskScores.put("Metal", 3.5);
        riskScores.put("Plastic", 4.0);
        riskScores.put("Rope", 3.2);
        riskScores.put("Wood", 2.8);
        
        return riskScores.getOrDefault(label, 3.0);
    }
    

}
