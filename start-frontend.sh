#!/bin/bash

echo "🌊 Ocean Clean AI - React 프론트엔드 시작"
echo "=========================================="

cd frontend

# Node.js가 설치되어 있는지 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다."
    echo "Node.js를 설치해주세요."
    exit 1
fi

# npm이 설치되어 있는지 확인
if ! command -v npm &> /dev/null; then
    echo "❌ npm이 설치되어 있지 않습니다."
    echo "npm을 설치해주세요."
    exit 1
fi

# 의존성이 설치되어 있는지 확인
if [ ! -d "node_modules" ]; then
    echo "📦 의존성을 설치합니다..."
    npm install
fi

# React 개발 서버 시작
echo "🚀 React 개발 서버를 시작합니다..."
npm start
