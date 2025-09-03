package com.oceanclean.ai.controller;

import com.oceanclean.ai.dto.WasteDataDto;
import com.oceanclean.ai.service.WasteDataService;
import com.oceanclean.ai.service.YOLOAnalysisService;
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
    
    @Autowired
    private YOLOAnalysisService yoloAnalysisService;
    
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
            String fullImagePath = "data/images/" + filename;
            
            // YOLO 모델을 사용한 실제 분석
            Map<String, Object> yoloResult = yoloAnalysisService.analyzeImage(fullImagePath);
            
            String detectedLabel;
            Double riskScore;
            Double confidence;
            
            if ((Boolean) yoloResult.get("success")) {
                detectedLabel = (String) yoloResult.get("detectedLabel");
                riskScore = (Double) yoloResult.get("riskScore");
                confidence = (Double) yoloResult.get("confidence");
            } else {
                // YOLO 분석 실패 시 기본값 사용
                detectedLabel = "Unknown";
                riskScore = 3.0;
                confidence = 0.0;
                response.put("yoloError", yoloResult.get("error"));
            }
            
            // 데이터베이스에 저장
            WasteDataDto savedData = wasteDataService.processUploadedImage(filename, detectedLabel, riskScore);
            
            response.put("success", true);
            response.put("filename", filename);
            response.put("detectedLabel", detectedLabel);
            response.put("riskScore", riskScore);
            response.put("confidence", confidence);
            response.put("data", savedData);
            response.put("yoloAnalysis", yoloResult);
            
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
    
    @GetMapping("/yolo-status")
    public ResponseEntity<Map<String, Object>> getYOLOStatus() {
        Map<String, Object> status = yoloAnalysisService.getServiceStatus();
        return ResponseEntity.ok(status);
    }

}
