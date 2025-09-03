# 🤖 YOLO 모델 통합 가이드

## 📋 개요

Ocean Clean AI 프로젝트에 YOLO 모델을 통합하여 실제 해양 쓰레기 이미지 분석 기능을 구현했습니다.

## 🛠️ 설치 및 설정

### 1. Python 의존성 설치

```bash
# YOLO 의존성 설치 스크립트 실행
./install-yolo-dependencies.sh

# 또는 수동 설치
pip install ultralytics torch torchvision opencv-python Pillow numpy
```

### 2. YOLO 모델 파일 확인

- 모델 파일: `backend/src/main/resources/best.pt`
- Python 스크립트: `backend/src/main/resources/yolo_analyzer.py`

### 3. 서버 실행

```bash
# 백엔드 실행
cd backend
mvn spring-boot:run

# 프론트엔드 실행 (새 터미널)
cd frontend
npm start
```

## 🔧 구현된 기능

### 1. YOLO 분석 서비스 (`YOLOAnalysisService.java`)

- Python 스크립트를 호출하여 YOLO 모델 실행
- 이미지 분석 결과를 JSON으로 파싱
- 위험도 점수 자동 계산
- 서비스 상태 모니터링

### 2. 업로드 컨트롤러 업데이트

- 실제 YOLO 모델 호출로 변경
- 분석 결과에 신뢰도 정보 추가
- 모든 감지된 객체 정보 표시
- 오류 처리 및 폴백 메커니즘

### 3. 프론트엔드 개선

- YOLO 분석 결과 상세 표시
- 신뢰도 점수 표시
- 모든 감지된 객체 목록
- YOLO 서비스 상태 확인

## 📊 분석 결과 구조

```json
{
  "success": true,
  "detectedLabel": "Plastic",
  "confidence": 0.85,
  "riskScore": 3.4,
  "allDetections": [
    {
      "class": "Plastic",
      "confidence": 0.85,
      "class_id": 4
    },
    {
      "class": "Metal",
      "confidence": 0.72,
      "class_id": 3
    }
  ]
}
```

## 🎯 위험도 계산 로직

```python
# 기본 위험도 점수 (라벨별)
base_risk_scores = {
    'Fish_net': 4.5,    # 어망: 매우 높음
    'Fish_trap': 3.0,   # 어구: 보통
    'Glass': 3.8,       # 유리: 높음
    'Metal': 3.5,       # 금속: 높음
    'Plastic': 4.0,     # 플라스틱: 높음
    'Rope': 3.2,        # 로프: 보통
    'Rubber_etc': 3.3,  # 고무류: 보통
    'Rubber_tire': 3.4, # 고무타이어: 보통
    'Wood': 2.8         # 목재: 낮음
}

# 신뢰도에 따른 조정
confidence_factor = 0.5 + (confidence * 0.5)  # 0.5 ~ 1.0
final_score = base_score * confidence_factor
```

## 🧪 테스트 방법

### 1. YOLO 서비스 상태 확인

1. 브라우저에서 `http://localhost:3000/test` 접속
2. "YOLO AI 서비스 상태" 섹션 확인
3. 모든 항목이 ✅ 표시되는지 확인

### 2. 이미지 분석 테스트

1. `http://localhost:3000/upload` 접속
2. 해양 쓰레기 이미지 업로드
3. 분석 결과 확인:
   - 감지된 객체 종류
   - 신뢰도 점수
   - 위험도 점수
   - 모든 감지된 객체 목록

## 🚨 문제 해결

### 1. Python 패키지 오류

```bash
# 패키지 재설치
pip uninstall ultralytics torch torchvision
pip install ultralytics torch torchvision
```

### 2. 모델 파일 오류

```bash
# 모델 파일 확인
ls -la backend/src/main/resources/best.pt

# 모델 파일 재복사
cp "/Users/bagseongmin/Desktop/해커톤/best.pt" backend/src/main/resources/
```

### 3. 권한 오류

```bash
# Python 스크립트 실행 권한 설정
chmod +x backend/src/main/resources/yolo_analyzer.py
```

## 📈 성능 최적화

### 1. 모델 로딩 최적화

- 첫 번째 분석 시 모델 로딩 시간이 길 수 있음
- 이후 분석은 더 빠르게 처리됨

### 2. 메모리 관리

- 대용량 이미지 처리 시 메모리 사용량 모니터링
- 필요시 이미지 크기 제한 설정

## 🔮 향후 개선 사항

1. **모델 캐싱**: 모델을 메모리에 로드하여 재사용
2. **배치 처리**: 여러 이미지 동시 분석
3. **GPU 가속**: CUDA 지원으로 분석 속도 향상
4. **실시간 분석**: 웹캠을 통한 실시간 쓰레기 탐지
5. **모델 업데이트**: 새로운 데이터로 모델 재훈련

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. Python 환경 및 패키지 설치 상태
2. YOLO 모델 파일 존재 여부
3. 백엔드 서버 로그
4. 브라우저 개발자 도구 콘솔

---

**🎉 YOLO 모델 통합 완료! 이제 실제 AI 기반 해양 쓰레기 분석이 가능합니다!**
