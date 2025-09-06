#!/bin/bash

echo "🎮 AWS 노들섬 퀴즈 RPG 시작!"
echo "🎨 스타듀밸리 x 포켓몬 스타일 게임"
echo ""

# 포트 확인
PORT=8000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  포트 $PORT가 이미 사용 중입니다."
    echo "🔄 다른 포트로 시도합니다..."
    PORT=8001
fi

echo "🚀 게임 서버를 포트 $PORT에서 시작합니다..."
echo "🌐 브라우저에서 http://localhost:$PORT 를 열어주세요!"
echo ""
echo "📋 게임 조작법:"
echo "   WASD: 이동"
echo "   Space: 상호작용"
echo "   1-4: 퀴즈 답변"
echo ""
echo "🎯 게임 목표:"
echo "   • 노들섬을 탐험하며 AWS 몬스터와 배틀"
echo "   • 퀴즈를 풀어 AWS 지식 습득"
echo "   • 레벨업하고 자격증 배지 수집"
echo ""
echo "⭐ 특징:"
echo "   • 스타듀밸리 스타일 픽셀 아트"
echo "   • 포켓몬 스타일 1:1 배틀"
echo "   • AWS CP/SAA/DVA/SAP 퀴즈"
echo ""
echo "🛑 게임을 종료하려면 Ctrl+C를 누르세요"
echo "=================================================="

# Python 서버 시작
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m http.server $PORT
else
    echo "❌ Python이 설치되어 있지 않습니다."
    echo "📥 Python을 설치하거나 다른 웹 서버를 사용해주세요."
    exit 1
fi