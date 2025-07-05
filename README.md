# Ocean Clean AI

이미지 업로드 및 처리를 위한 웹 애플리케이션입니다.

## 📁 프로젝트 구조

```
ocean-clean-ai/
├── frontend/          # React 프론트엔드
│   ├── src/
│   │   ├── App.jsx    # 메인 React 컴포넌트
│   │   ├── App.css    # 스타일 파일
│   │   ├── main.jsx   # React 앱 진입점
│   │   └── index.css  # 글로벌 스타일
│   ├── public/
│   ├── package.json   # 프론트엔드 의존성
│   └── vite.config.js # Vite 설정
├── backend/           # Go 백엔드
│   ├── main.go        # Go 서버
│   ├── go.mod         # Go 모듈 의존성
│   ├── go.sum         # Go 모듈 체크섬
│   └── uploads/       # 업로드된 이미지 저장 폴더
└── README.md          # 프로젝트 설명서
```

## 🚀 실행 방법

### 백엔드 실행 (Go)

```bash
cd backend
go mod tidy
go run main.go
```

- 서버 주소: http://localhost:3333
- API 엔드포인트:
  - `GET /api/health` - 서버 상태 확인
  - `POST /api/upload-image` - 이미지 업로드
  - `GET /api/images` - 업로드된 이미지 목록
  - `DELETE /api/delete-image/<filename>` - 이미지 삭제

### 프론트엔드 실행 (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

- 서버 주소: http://localhost:3000
- 이미지 업로드 및 미리보기 기능

## 🛠️ 기술 스택

### Frontend
- React 19
- Vite
- CSS3

### Backend
- Go 1.21+
- Gin (웹 프레임워크)
- Gin-CORS (CORS 미들웨어)
- UUID (고유 ID 생성)

## 📝 기능

- 🖼️ 이미지 파일 업로드
- 👀 이미지 미리보기
- 📊 파일 정보 표시
- 🗑️ 이미지 삭제
- 📱 반응형 디자인

