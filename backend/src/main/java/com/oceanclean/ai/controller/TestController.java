package com.oceanclean.ai.controller;

import com.oceanclean.ai.repository.WasteDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {
    
    @Autowired
    private WasteDataRepository wasteDataRepository;
    
    @GetMapping("/data-count")
    public ResponseEntity<Map<String, Object>> getDataCount() {
        Map<String, Object> response = new HashMap<>();
        long count = wasteDataRepository.count();
        response.put("totalCount", count);
        response.put("message", "데이터 로드 완료");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/sample-data")
    public ResponseEntity<?> getSampleData() {
        return ResponseEntity.ok(wasteDataRepository.findAll().stream().limit(5).toList());
    }
}
