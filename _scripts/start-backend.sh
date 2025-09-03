#!/bin/bash

echo "🌊 Ocean Clean AI - Spring Boot 백엔드 시작"
echo "=========================================="

cd backend

# Maven이 설치되어 있는지 확인
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven이 설치되어 있지 않습니다."
    echo "Maven을 설치하거나 IDE에서 직접 실행해주세요."
    exit 1
fi

# Spring Boot 애플리케이션 실행
echo "🚀 Spring Boot 애플리케이션을 시작합니다..."
mvn spring-boot:run
