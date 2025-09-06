#!/bin/bash

echo "🎮 AWS 노들섬 퀴즈 RPG GUI 시작!"
echo "📦 Electron 앱으로 실행합니다..."
echo ""

# Node.js 및 npm 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다."
    echo "📥 https://nodejs.org 에서 Node.js를 설치해주세요."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm이 설치되어 있지 않습니다."
    exit 1
fi

# package.json이 있는지 확인
if [ ! -f "package.json" ]; then
    echo "❌ package.json 파일이 없습니다."
    exit 1
fi

# node_modules가 없으면 설치
if [ ! -d "node_modules" ]; then
    echo "📦 의존성 설치 중..."
    npm install
fi

echo "🚀 게임 시작!"
echo "🎯 스타듀밸리 x 포켓몬 스타일 AWS 학습 게임"
echo ""

# Electron 앱 실행
npm start