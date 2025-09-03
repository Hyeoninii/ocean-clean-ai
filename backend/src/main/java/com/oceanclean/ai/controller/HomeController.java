package com.oceanclean.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class HomeController {
    
    @GetMapping("/home")
    public ResponseEntity<Map<String, Object>> getHomeData() {
        Map<String, Object> homeData = new HashMap<>();
        homeData.put("title", "🌏 Ocean Clean AI");
        homeData.put("description", "해양 쓰레기의 위험도를 분석하고 시각화하는 AI 기반 환경 플랫폼입니다.");
        homeData.put("features", new String[]{
            "🚢 선박 항로 및 어업 지역 보호",
            "🐟 해양 생태계 데이터 기반 보호", 
            "📷 AI 이미지 분석 + 위험도 지도 시각화"
        });
        homeData.put("imagePath", "/assets/image.png");
        
        return ResponseEntity.ok(homeData);
    }
}
