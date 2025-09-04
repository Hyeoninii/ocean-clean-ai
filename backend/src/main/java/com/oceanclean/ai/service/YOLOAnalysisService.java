package com.oceanclean.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Service
public class YOLOAnalysisService {
    
    private static final String COASTAL_WASTE_MODEL_PATH = "src/main/resources/best.pt";
    private static final String FLOATING_WASTE_MODEL_PATH = "src/main/resources/floating_waste_model.pt";
    private static final String PYTHON_SCRIPT_PATH = "src/main/resources/yolo_analyzer.py";
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Autowired
    private WasteDataService wasteDataService;
    
    /**
     * YOLO 모델을 사용하여 이미지를 분석합니다.
     * 
     * @param imagePath 분석할 이미지 파일 경로
     * @param modelType 모델 타입 ("coastal" 또는 "floating")
     * @return 분석 결과 (감지된 라벨, 신뢰도, 위험도 점수)
     */
    public Map<String, Object> analyzeImage(String imagePath, String modelType) {
        // 기존 데이터베이스의 위험도 점수들을 가져와서 R 코드 방식 적용
        java.util.List<Double> existingRiskScores = wasteDataService.getAllRiskScores();
        return analyzeImage(imagePath, modelType, existingRiskScores);
    }
    
    /**
     * YOLO 모델을 사용하여 이미지를 분석합니다. (기존 위험도 데이터 포함)
     * 
     * @param imagePath 분석할 이미지 파일 경로
     * @param modelType 모델 타입 ("coastal" 또는 "floating")
     * @param existingRiskScores 기존 데이터베이스의 위험도 점수들
     * @return 분석 결과 (감지된 라벨, 신뢰도, 위험도 점수)
     */
    public Map<String, Object> analyzeImage(String imagePath, String modelType, java.util.List<Double> existingRiskScores) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 모델 경로 선택
            String modelPath = getModelPath(modelType);
            
            // 기존 위험도 데이터를 JSON으로 변환
            String riskScoresJson = "[]";
            if (existingRiskScores != null && !existingRiskScores.isEmpty()) {
                riskScoresJson = objectMapper.writeValueAsString(existingRiskScores);
            }
            
            // Python 스크립트 실행
            ProcessBuilder processBuilder = new ProcessBuilder(
                "python3",
                PYTHON_SCRIPT_PATH,
                imagePath,
                modelPath,
                riskScoresJson
            );
            
            // 작업 디렉토리를 프로젝트 루트로 설정
            processBuilder.directory(new File(System.getProperty("user.dir")));
            
            // 환경 변수 설정 (Python 경로 등)
            Map<String, String> env = processBuilder.environment();
            env.put("PYTHONPATH", System.getProperty("user.dir"));
            
            Process process = processBuilder.start();
            
            // 표준 출력 읽기 (JSON만 추출)
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            boolean jsonStarted = false;
            
            while ((line = reader.readLine()) != null) {
                // JSON 시작을 찾기
                if (line.trim().startsWith("{")) {
                    jsonStarted = true;
                }
                
                if (jsonStarted) {
                    output.append(line);
                }
            }
            
            // 에러 출력 읽기
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            StringBuilder errorOutput = new StringBuilder();
            while ((line = errorReader.readLine()) != null) {
                errorOutput.append(line);
            }
            
            // 프로세스 완료 대기
            int exitCode = process.waitFor();
            
            if (exitCode == 0) {
                // JSON 결과 파싱
                String jsonOutput = output.toString();
                JsonNode jsonNode = objectMapper.readTree(jsonOutput);
                
                if (jsonNode.get("success").asBoolean()) {
                    result.put("success", true);
                    result.put("detectedLabel", jsonNode.get("detected_label").asText());
                    result.put("confidence", jsonNode.get("confidence").asDouble());
                    result.put("riskScore", jsonNode.get("risk_score").asDouble());
                    result.put("allDetections", jsonNode.get("all_detections"));
                } else {
                    result.put("success", false);
                    result.put("error", jsonNode.get("error").asText());
                    result.put("detectedLabel", "Unknown");
                    result.put("confidence", 0.0);
                    result.put("riskScore", 3.0);
                }
            } else {
                result.put("success", false);
                result.put("error", "Python script execution failed: " + errorOutput.toString());
                result.put("detectedLabel", "Unknown");
                result.put("confidence", 0.0);
                result.put("riskScore", 3.0);
            }
            
        } catch (IOException | InterruptedException e) {
            result.put("success", false);
            result.put("error", "YOLO analysis failed: " + e.getMessage());
            result.put("detectedLabel", "Unknown");
            result.put("confidence", 0.0);
            result.put("riskScore", 3.0);
        }
        
        return result;
    }
    
    /**
     * 기본 YOLO 모델 파일이 존재하는지 확인합니다.
     * 
     * @return 모델 파일 존재 여부
     */
    public boolean isModelAvailable() {
        return isModelAvailable(COASTAL_WASTE_MODEL_PATH);
    }
    
    /**
     * Python 스크립트가 존재하는지 확인합니다.
     * 
     * @return 스크립트 파일 존재 여부
     */
    public boolean isScriptAvailable() {
        File scriptFile = new File(PYTHON_SCRIPT_PATH);
        return scriptFile.exists();
    }
    
    /**
     * YOLO 분석 서비스 상태를 확인합니다.
     * 
     * @return 서비스 상태 정보
     */
    public Map<String, Object> getServiceStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("coastalModelAvailable", isModelAvailable(COASTAL_WASTE_MODEL_PATH));
        status.put("floatingModelAvailable", isModelAvailable(FLOATING_WASTE_MODEL_PATH));
        status.put("scriptAvailable", isScriptAvailable());
        status.put("coastalModelPath", COASTAL_WASTE_MODEL_PATH);
        status.put("floatingModelPath", FLOATING_WASTE_MODEL_PATH);
        status.put("scriptPath", PYTHON_SCRIPT_PATH);
        
        // Python 설치 확인
        try {
            ProcessBuilder processBuilder = new ProcessBuilder("python3", "--version");
            Process process = processBuilder.start();
            int exitCode = process.waitFor();
            status.put("pythonAvailable", exitCode == 0);
        } catch (Exception e) {
            status.put("pythonAvailable", false);
        }
        
        return status;
    }
    
    /**
     * 모델 타입에 따라 모델 경로를 반환합니다.
     * 
     * @param modelType 모델 타입 ("coastal" 또는 "floating")
     * @return 모델 파일 경로
     */
    private String getModelPath(String modelType) {
        switch (modelType.toLowerCase()) {
            case "floating":
                return FLOATING_WASTE_MODEL_PATH;
            case "coastal":
            default:
                return COASTAL_WASTE_MODEL_PATH;
        }
    }
    
    /**
     * 사용 가능한 모델 목록을 반환합니다.
     * 
     * @return 모델 목록
     */
    public Map<String, Object> getAvailableModels() {
        Map<String, Object> models = new HashMap<>();
        
        // 해안 쓰레기 모델
        Map<String, Object> coastalModel = new HashMap<>();
        coastalModel.put("name", "해안 쓰레기");
        coastalModel.put("type", "coastal");
        coastalModel.put("path", COASTAL_WASTE_MODEL_PATH);
        coastalModel.put("available", isModelAvailable(COASTAL_WASTE_MODEL_PATH));
        
        // 부유 쓰레기 모델
        Map<String, Object> floatingModel = new HashMap<>();
        floatingModel.put("name", "부유 쓰레기");
        floatingModel.put("type", "floating");
        floatingModel.put("path", FLOATING_WASTE_MODEL_PATH);
        floatingModel.put("available", isModelAvailable(FLOATING_WASTE_MODEL_PATH));
        
        models.put("coastal", coastalModel);
        models.put("floating", floatingModel);
        
        return models;
    }
    
    /**
     * 특정 모델 파일이 존재하는지 확인합니다.
     * 
     * @param modelPath 모델 파일 경로
     * @return 모델 파일 존재 여부
     */
    private boolean isModelAvailable(String modelPath) {
        File modelFile = new File(modelPath);
        return modelFile.exists();
    }
}
