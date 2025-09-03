package com.oceanclean.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    
    private static final String YOLO_MODEL_PATH = "src/main/resources/best.pt";
    private static final String PYTHON_SCRIPT_PATH = "src/main/resources/yolo_analyzer.py";
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * YOLO 모델을 사용하여 이미지를 분석합니다.
     * 
     * @param imagePath 분석할 이미지 파일 경로
     * @return 분석 결과 (감지된 라벨, 신뢰도, 위험도 점수)
     */
    public Map<String, Object> analyzeImage(String imagePath) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Python 스크립트 실행
            ProcessBuilder processBuilder = new ProcessBuilder(
                "python3",
                PYTHON_SCRIPT_PATH,
                imagePath,
                YOLO_MODEL_PATH
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
     * YOLO 모델 파일이 존재하는지 확인합니다.
     * 
     * @return 모델 파일 존재 여부
     */
    public boolean isModelAvailable() {
        File modelFile = new File(YOLO_MODEL_PATH);
        return modelFile.exists();
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
        status.put("modelAvailable", isModelAvailable());
        status.put("scriptAvailable", isScriptAvailable());
        status.put("modelPath", YOLO_MODEL_PATH);
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
}
