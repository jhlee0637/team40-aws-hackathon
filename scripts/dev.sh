#!/bin/bash

# AWS 노들섬 퀴즈 RPG - 개발 스크립트

echo "🎮 AWS 노들섬 퀴즈 RPG 개발 환경 시작"
echo "=====================================\n"

# 1. 데이터 번들링
echo "📦 데이터 번들링 중..."
python scripts/bundle-data.py

if [ $? -eq 0 ]; then
    echo "✅ 데이터 번들링 완료!\n"
else
    echo "❌ 데이터 번들링 실패!"
    exit 1
fi

# 2. 서버 시작
echo "🚀 로컬 서버 시작 중..."
echo "브라우저에서  으로 접속하세요\n"
http://localhost:8080
# 포트 8080이 사용 중이면 8081 시도
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  포트 8080이 사용 중입니다. 포트 8081을 사용합니다."
    python -m http.server 8081
else
    python -m http.server 8080
fi
