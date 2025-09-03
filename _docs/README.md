# 🌊 Ocean Clean AI

해양 쓰레기의 위험도를 분석하고 시각화하는 AI 기반 환경 플랫폼입니다.

## 📋 프로젝트 개요

이 프로젝트는 해양 쓰레기 탐지 시스템을 Spring Boot + React로 구현한 것입니다.

### 주요 기능
- 🏠 **메인 페이지**: 프로젝트 소개 및 기능 안내
- 📊 **데이터 현황**: 쓰레기 종류별 필터링 및 통계 정보
- 🗺️ **지도 페이지**: 위험도 등급에 따른 시각화
- 📷 **업로드 페이지**: YOLO 모델을 사용한 이미지 분석

## 🏗️ 프로젝트 구조

```
ocean-clean-ai/
├── backend/                 # Spring Boot 백엔드
│   ├── src/main/java/com/oceanclean/ai/
│   │   ├── controller/      # REST API 컨트롤러
│   │   ├── service/         # 비즈니스 로직
│   │   ├── repository/      # 데이터 접근 계층
│   │   ├── entity/          # JPA 엔티티
│   │   ├── dto/             # 데이터 전송 객체
│   │   └── config/          # 설정 클래스
│   └── pom.xml              # Maven 의존성
├── frontend/                # React 프론트엔드
│   ├── src/
│   │   ├── components/      # 재사용 가능한 컴포넌트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── services/        # API 서비스
│   │   ├── types/           # TypeScript 타입 정의
│   │   └── assets/          # 정적 파일
│   └── package.json         # npm 의존성
├── data/                    # 데이터 저장소
│   ├── images/              # 이미지 파일
│   └── csv/                 # CSV 데이터 파일
├── start-backend.sh         # 백엔드 실행 스크립트
├── start-frontend.sh        # 프론트엔드 실행 스크립트
└── README.md               # 프로젝트 문서
```

## 🚀 실행 방법

### 사전 요구사항
- Java 17 이상
- Maven 3.6 이상
- Node.js 16 이상
- npm 또는 yarn

### 1. 백엔드 실행 (Spring Boot)

```bash
# 스크립트 사용
./start-backend.sh

# 또는 직접 실행
cd backend
mvn spring-boot:run
```

백엔드는 `http://localhost:8080`에서 실행됩니다.

### 2. 프론트엔드 실행 (React)

```bash
# 스크립트 사용
./start-frontend.sh

# 또는 직접 실행
cd frontend
npm install
npm start
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

## 📡 API 엔드포인트

### 쓰레기 데이터 API
- `GET /api/waste-data` - 모든 쓰레기 데이터 조회
- `GET /api/waste-data/page` - 페이지네이션으로 데이터 조회
- `GET /api/waste-data/filter` - 필터링된 데이터 조회
- `GET /api/waste-data/labels` - 고유 라벨 목록 조회
- `GET /api/waste-data/statistics` - 통계 정보 조회
- `POST /api/waste-data/upload` - 이미지 업로드 및 분석

### 홈 API
- `GET /api/home` - 홈 페이지 데이터 조회

## 🗄️ 데이터베이스

프로젝트는 H2 인메모리 데이터베이스를 사용합니다.
- H2 콘솔: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: `password`

## 🎨 주요 기능 설명

### 1. 메인 페이지
- 프로젝트 소개 및 주요 기능 안내
- 이미지 업로드 페이지로의 이동 버튼

### 2. 데이터 현황 페이지
- 쓰레기 종류별 필터링 (어망, 어구, 유리, 금속, 플라스틱 등)
- 위험도별 필터링 (높음, 보통, 낮음)
- 통계 정보 표시 (총 탐지 건수, 평균 위험도 등)
- 페이지네이션을 통한 데이터 탐색

### 3. 지도 페이지
- Leaflet을 사용한 인터랙티브 지도
- 위험도 등급에 따른 색상 구분 마커
- 마커 클릭 시 상세 정보 팝업
- 지도 통계 정보

### 4. 업로드 페이지
- 이미지 파일 업로드
- 진행률 표시 바
- YOLO 모델 분석 시뮬레이션
- 분석 결과 표시

## 🔧 기술 스택

### 백엔드
- **Spring Boot 3.2.0** - 웹 프레임워크
- **Spring Data JPA** - 데이터 접근 계층
- **H2 Database** - 인메모리 데이터베이스
- **Maven** - 의존성 관리

### 프론트엔드
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **React Router** - 라우팅
- **Leaflet** - 지도 라이브러리
- **Axios** - HTTP 클라이언트

## 📝 개발 노트

### 데이터 초기화
애플리케이션 시작 시 `data/csv/test.csv` 파일의 데이터가 자동으로 데이터베이스에 로드됩니다.

### 이미지 서빙
업로드된 이미지는 `data/images/` 폴더에 저장되며, `/data/images/**` 경로로 접근할 수 있습니다.

### CORS 설정
프론트엔드(`http://localhost:3000`)에서 백엔드 API에 접근할 수 있도록 CORS가 설정되어 있습니다.

## 🚧 향후 개선 사항

1. **실제 YOLO 모델 통합**: 현재는 시뮬레이션으로 동작
2. **사용자 인증**: 로그인/회원가입 기능
3. **데이터베이스 영구 저장**: H2 대신 PostgreSQL 사용
4. **실시간 알림**: WebSocket을 통한 실시간 업데이트
5. **모바일 반응형**: 모바일 디바이스 최적화

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**해양 보호의 첫걸음, Ocean Clean AI** 🌊
