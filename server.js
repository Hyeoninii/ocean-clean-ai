const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// CORS 설정
app.use(cors());
app.use(express.json());

// 업로드된 이미지를 저장할 폴더 생성
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 설정 - 이미지 파일 업로드
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 파일명 중복 방지를 위해 타임스탬프 추가
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  },
  fileFilter: function (req, file, cb) {
    // 이미지 파일만 허용
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
    }
  }
});

// 이미지 업로드 API
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: '이미지 파일이 선택되지 않았습니다.' 
      });
    }

    console.log('업로드된 파일:', req.file);

    res.json({
      success: true,
      message: '이미지가 성공적으로 업로드되었습니다!',
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });

  } catch (error) {
    console.error('업로드 에러:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

// 업로드된 이미지 목록 조회 API
app.get('/api/images', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
    });

    const imageList = imageFiles.map(filename => ({
      filename,
      path: `/uploads/${filename}`,
      size: fs.statSync(path.join(uploadDir, filename)).size
    }));

    res.json({
      success: true,
      images: imageList
    });

  } catch (error) {
    console.error('이미지 목록 조회 에러:', error);
    res.status(500).json({ 
      success: false, 
      message: '이미지 목록을 가져오는데 실패했습니다.' 
    });
  }
});

// 업로드된 이미지 파일 서빙
app.use('/uploads', express.static(uploadDir));

// 서버 상태 확인 API
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '서버가 정상적으로 실행 중입니다.',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`📁 업로드 폴더: ${uploadDir}`);
}); 