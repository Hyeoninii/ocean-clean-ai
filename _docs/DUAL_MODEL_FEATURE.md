# 🌊🏖️ 부유 쓰레기 & 해안 쓰레기 듀얼 모델 기능

## 📋 개요

Ocean Clean AI 프로젝트에 부유 쓰레기와 해안 쓰레기 두 가지 YOLO 모델을 선택할 수 있는 기능을 추가했습니다. 사용자는 분석하고자 하는 이미지의 특성에 따라 적절한 모델을 선택할 수 있습니다.

## 🔧 구현된 기능

### 1. **듀얼 모델 지원**
- **🏖️ 해안 쓰레기 모델**: `best.pt` (best (1).pt에서 복사)
- **🌊 부유 쓰레기 모델**: `floating_waste_model.pt` (best.pt에서 복사)

### 2. **백엔드 업데이트**

#### `YOLOAnalysisService.java`
- 모델 타입에 따른 경로 선택 로직 추가
- 사용 가능한 모델 목록 조회 기능
- 각 모델의 상태 확인 기능

```java
public Map<String, Object> analyzeImage(String imagePath, String modelType) {
    String modelPath = getModelPath(modelType);
    // 모델 타입에 따라 적절한 모델 파일 사용
}

private String getModelPath(String modelType) {
    switch (modelType.toLowerCase()) {
        case "floating": return FLOATING_WASTE_MODEL_PATH;
        case "coastal": 
        default: return COASTAL_WASTE_MODEL_PATH;
    }
}
```

#### `WasteDataController.java`
- 업로드 API에 `modelType` 파라미터 추가
- 사용 가능한 모델 목록 API 엔드포인트 추가

```java
@PostMapping("/upload")
public ResponseEntity<Map<String, Object>> uploadImage(
    @RequestParam("file") MultipartFile file,
    @RequestParam(value = "modelType", defaultValue = "coastal") String modelType) {
    // 선택된 모델로 분석 수행
}
```

### 3. **프론트엔드 업데이트**

#### 모델 선택 UI
- 라디오 버튼으로 모델 선택
- 모델 사용 가능 여부 표시
- 선택된 모델 정보 표시

```tsx
<div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
  <input type="radio" id="coastal" name="modelType" value="coastal" />
  <label htmlFor="coastal">🏖️ 해안 쓰레기 모델</label>
  
  <input type="radio" id="floating" name="modelType" value="floating" />
  <label htmlFor="floating">🌊 부유 쓰레기 모델</label>
</div>
```

#### API 서비스 업데이트
- `uploadImage` 함수에 `modelType` 파라미터 추가
- 사용 가능한 모델 목록 조회 API 추가

## 🎯 사용 방법

### 1. **모델 선택**
1. 업로드 페이지 접속: `http://localhost:3000/upload`
2. "🤖 AI 모델 선택" 섹션에서 원하는 모델 선택:
   - 🏖️ **해안 쓰레기 모델**: 해안가나 육지 근처의 쓰레기 분석
   - 🌊 **부유 쓰레기 모델**: 바다 위에 떠다니는 쓰레기 분석

### 2. **이미지 업로드 및 분석**
1. 선택된 모델로 이미지 분석 수행
2. 모델별 특화된 분석 결과 확인
3. 바운딩박스와 함께 결과 표시

### 3. **모델 상태 확인**
- 테스트 페이지: `http://localhost:3000/test`
- 두 모델의 사용 가능 여부 확인
- 모델 파일 경로 및 상태 정보 표시

## 📊 API 엔드포인트

### **이미지 업로드 (모델 선택)**
```
POST /api/waste-data/upload
Content-Type: multipart/form-data

Parameters:
- file: 이미지 파일
- modelType: "coastal" 또는 "floating" (기본값: "coastal")
```

### **사용 가능한 모델 목록**
```
GET /api/waste-data/available-models

Response:
{
  "coastal": {
    "name": "해안 쓰레기",
    "type": "coastal",
    "path": "src/main/resources/best.pt",
    "available": true
  },
  "floating": {
    "name": "부유 쓰레기", 
    "type": "floating",
    "path": "src/main/resources/floating_waste_model.pt",
    "available": true
  }
}
```

### **YOLO 서비스 상태**
```
GET /api/waste-data/yolo-status

Response:
{
  "coastalModelAvailable": true,
  "floatingModelAvailable": true,
  "scriptAvailable": true,
  "coastalModelPath": "src/main/resources/best.pt",
  "floatingModelPath": "src/main/resources/floating_waste_model.pt",
  "scriptPath": "src/main/resources/yolo_analyzer.py",
  "pythonAvailable": true
}
```

## 🔧 모델 파일 구조

```
backend/src/main/resources/
├── best.pt                    # 해안 쓰레기 모델 (best (1).pt에서 복사)
├── floating_waste_model.pt    # 부유 쓰레기 모델 (best.pt에서 복사)
└── yolo_analyzer.py          # YOLO 분석 스크립트
```

## 🎨 UI 특징

### **모델 선택 인터페이스**
- 직관적인 라디오 버튼 선택
- 모델별 이모지 아이콘 (🏖️ 해안, 🌊 부유)
- 사용 불가능한 모델은 비활성화
- 선택된 모델 정보 표시

### **상태 표시**
- ✅ 사용 가능 / ❌ 사용 불가
- 모델 경로 정보
- 실시간 상태 업데이트

## 🧪 테스트 방법

### 1. **Python 스크립트 직접 테스트**
```bash
# 해안 쓰레기 모델 테스트
python3 src/main/resources/yolo_analyzer.py ../data/images/sample.jpg src/main/resources/best.pt

# 부유 쓰레기 모델 테스트  
python3 src/main/resources/yolo_analyzer.py ../data/images/sample.jpg src/main/resources/floating_waste_model.pt
```

### 2. **웹 애플리케이션 테스트**
1. 백엔드 서버 실행: `mvn spring-boot:run`
2. 프론트엔드 서버 실행: `npm start`
3. 업로드 페이지에서 각 모델로 이미지 분석 테스트

## 🔮 향후 개선 사항

1. **자동 모델 선택**: 이미지 특성 분석으로 자동 모델 선택
2. **모델 성능 비교**: 두 모델의 분석 결과 비교 기능
3. **하이브리드 분석**: 두 모델 결과를 결합한 종합 분석
4. **모델 업데이트**: 새로운 모델 버전 자동 감지 및 업데이트
5. **사용 통계**: 모델별 사용 빈도 및 성능 통계

## 📞 문제 해결

### **모델 파일이 인식되지 않는 경우**
1. 모델 파일 존재 여부 확인: `ls -la src/main/resources/*.pt`
2. 파일 권한 확인: `chmod 644 src/main/resources/*.pt`
3. 백엔드 서버 재시작

### **모델 선택이 작동하지 않는 경우**
1. 브라우저 개발자 도구에서 네트워크 요청 확인
2. API 응답에서 `modelType` 파라미터 확인
3. 백엔드 로그에서 모델 경로 확인

---

**🎉 듀얼 모델 기능 구현 완료! 이제 해안 쓰레기와 부유 쓰레기를 각각 특화된 모델로 분석할 수 있습니다!**
