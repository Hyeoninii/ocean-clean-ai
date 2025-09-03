#!/bin/bash

echo "🤖 YOLO 모델 의존성 설치 스크립트"
echo "=================================="

# Python 버전 확인
echo "Python 버전 확인 중..."
python3 --version

# pip 업그레이드
echo "pip 업그레이드 중..."
python3 -m pip install --upgrade pip

# YOLO 관련 패키지 설치
echo "YOLO 관련 패키지 설치 중..."
python3 -m pip install ultralytics torch torchvision opencv-python Pillow numpy

# 설치 확인
echo "설치된 패키지 확인 중..."
python3 -c "import ultralytics; print('✅ ultralytics 설치 완료')"
python3 -c "import torch; print('✅ torch 설치 완료')"
python3 -c "import cv2; print('✅ opencv-python 설치 완료')"

echo "🎉 YOLO 의존성 설치 완료!"
echo ""
echo "다음 단계:"
echo "1. 백엔드 서버 실행"
echo "2. 프론트엔드 서버 실행"
echo "3. 테스트 페이지에서 YOLO 상태 확인"
echo "4. 업로드 페이지에서 이미지 분석 테스트"
