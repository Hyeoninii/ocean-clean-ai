package com.oceanclean.ai.service;

import com.oceanclean.ai.entity.WasteData;
import com.oceanclean.ai.repository.WasteDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Paths;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.util.List;
import java.util.Map;

@Service
public class DataInitializationService implements CommandLineRunner {
    
    @Autowired
    private WasteDataRepository wasteDataRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // 애플리케이션 시작 시 항상 데이터 초기화 (개발용)
        System.out.println("데이터 초기화 시작...");
        wasteDataRepository.deleteAll(); // 기존 데이터 삭제
        loadDataFromCSV();
    }
    
    private void loadDataFromCSV() {
        // JSON 파일에서 데이터 로드 (Python 스크립트로 미리 변환된 데이터)
        // 백엔드 폴더에서 실행되므로 상위 폴더의 data 경로 사용
        // 실제 이미지가 존재하는 데이터만 사용
        String jsonPath = "data/filtered_data.json";
        
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            List<Map<String, Object>> dataList = objectMapper.readValue(
                new java.io.File(jsonPath), 
                new TypeReference<List<Map<String, Object>>>() {}
            );
            
            int loadedCount = 0;
            for (Map<String, Object> data : dataList) {
                try {
                    WasteData wasteData = new WasteData(
                        (String) data.get("fileName"),
                        ((Number) data.get("latitude")).doubleValue(),
                        ((Number) data.get("longitude")).doubleValue(),
                        (String) data.get("label"),
                        ((Number) data.get("weight")).doubleValue(),
                        ((Number) data.get("cluster")).intValue(),
                        ((Number) data.get("riskScore")).doubleValue(),
                        (String) data.get("imagePath")
                    );
                    
                    wasteDataRepository.save(wasteData);
                    loadedCount++;
                } catch (Exception e) {
                    System.err.println("데이터 저장 오류: " + e.getMessage());
                }
            }
            
            System.out.println("JSON 데이터 로드 완료: " + loadedCount + "개 레코드");
            
        } catch (IOException e) {
            System.err.println("JSON 파일 읽기 오류: " + e.getMessage());
            // JSON 파일이 없으면 기존 CSV 방식으로 폴백
            loadDataFromCSVFiles();
        }
    }
    
    private void loadDataFromCSVFiles() {
        // 여러 CSV 파일에서 데이터 로드 (폴백 방식)
        String[] csvFiles = {
            "data/csv/ocean_risk.csv",
            "data/csv/test.csv", 
            "data/csv/image_data.csv"
        };
        
        for (String csvPath : csvFiles) {
            loadCSVFile(csvPath);
        }
        
        System.out.println("CSV 데이터 로드 완료: " + wasteDataRepository.count() + "개 레코드");
    }
    
    private void loadCSVFile(String csvPath) {
        try (BufferedReader br = new BufferedReader(new FileReader(csvPath))) {
            String line;
            boolean isFirstLine = true;
            int loadedCount = 0;
            
            while ((line = br.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue; // 헤더 스킵
                }
                
                // CSV 파일 형식에 따라 다르게 처리
                if (csvPath.contains("image_data.csv")) {
                    loadedCount += loadImageDataLine(line);
                } else {
                    loadedCount += loadOceanRiskLine(line);
                }
            }
            
            System.out.println(csvPath + " 로드 완료: " + loadedCount + "개 레코드");
            
        } catch (IOException e) {
            System.err.println("CSV 파일 읽기 오류 (" + csvPath + "): " + e.getMessage());
        }
    }
    
    private int loadOceanRiskLine(String line) {
        try {
            String[] values = line.split(",");
            if (values.length >= 7) {
                String fileName = values[0].replace("\"", "");
                Double latitude = Double.parseDouble(values[1]);
                Double longitude = Double.parseDouble(values[2]);
                String label = values[3].replace("\"", "");
                Double weight = Double.parseDouble(values[4]);
                Integer cluster = Integer.parseInt(values[5]);
                Double riskScore = Double.parseDouble(values[6]);
                
                // 이미지 파일명 생성
                String imageFileName = fileName.replace(".json", ".jpg");
                String imagePath = "data/images/" + imageFileName;
                
                WasteData wasteData = new WasteData(
                        fileName, latitude, longitude, label, 
                        weight, cluster, riskScore, imagePath
                );
                
                wasteDataRepository.save(wasteData);
                return 1;
            }
        } catch (NumberFormatException e) {
            System.err.println("CSV 파싱 오류: " + line);
        }
        return 0;
    }
    
    private int loadImageDataLine(String line) {
        try {
            String[] values = line.split(",");
            if (values.length >= 6) {
                String fileName = values[0];
                Double latitude = Double.parseDouble(values[1]);
                Double longitude = Double.parseDouble(values[2]);
                String label = values[3];
                Double confidence = Double.parseDouble(values[4]);
                Double riskScore = Double.parseDouble(values[5]);
                
                // 이미지 파일명 생성
                String imagePath = "data/images/" + fileName;
                
                WasteData wasteData = new WasteData(
                        fileName, latitude, longitude, label, 
                        confidence, 1, riskScore, imagePath
                );
                
                wasteDataRepository.save(wasteData);
                return 1;
            }
        } catch (NumberFormatException e) {
            System.err.println("CSV 파싱 오류: " + line);
        }
        return 0;
    }
}
