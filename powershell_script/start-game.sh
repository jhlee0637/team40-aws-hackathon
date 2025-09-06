#!/bin/bash

# AWS Cert Quest - 노들노들 이야기 게임 실행 스크립트
# Bash 버전

echo "🌾 AWS 노들노들 이야기 게임을 시작합니다..."
echo ""

# 현재 디렉토리 확인
echo "📁 현재 위치: $(pwd)"

# index.html 파일 존재 확인
if [ ! -f "index.html" ]; then
    echo "❌ index.html 파일을 찾을 수 없습니다."
    echo "   게임 폴더에서 스크립트를 실행해주세요."
    exit 1
fi

# 사용 가능한 서버 옵션 확인 및 실행
echo "🚀 로컬 서버를 시작합니다..."

# Python 확인
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    PYTHON_CMD=""
fi

# Node.js 확인
NODE_AVAILABLE=$(command -v node)
NPX_AVAILABLE=$(command -v npx)

if [ ! -z "$PYTHON_CMD" ]; then
    echo "✅ Python을 사용하여 서버를 시작합니다."
    echo "🌐 브라우저에서 http://localhost:8000 으로 접속하세요!"
    echo "⏹️  서버를 중지하려면 Ctrl+C를 누르세요."
    echo ""
    
    # 브라우저 자동 열기 (3초 후)
    (sleep 3 && open http://localhost:8000 2>/dev/null || xdg-open http://localhost:8000 2>/dev/null) &
    
    $PYTHON_CMD -m http.server 8000
    
elif [ ! -z "$NPX_AVAILABLE" ]; then
    echo "✅ Node.js를 사용하여 서버를 시작합니다."
    echo "🌐 브라우저에서 http://localhost:8080 으로 접속하세요!"
    echo "⏹️  서버를 중지하려면 Ctrl+C를 누르세요."
    echo ""
    
    # 브라우저 자동 열기 (3초 후)
    (sleep 3 && open http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080 2>/dev/null) &
    
    npx http-server -p 8080
    
else
    echo "⚠️  Python이나 Node.js를 찾을 수 없습니다."
    echo "📖 대안 방법:"
    echo "   1. Python 설치: https://python.org"
    echo "   2. Node.js 설치: https://nodejs.org"
    echo "   3. 또는 index.html을 브라우저로 직접 열기"
    echo ""
    
    read -p "index.html을 브라우저로 바로 열까요? (y/N): " choice
    if [[ $choice == "y" || $choice == "Y" ]]; then
        echo "🌐 브라우저에서 게임을 엽니다..."
        open index.html 2>/dev/null || xdg-open index.html 2>/dev/null || echo "브라우저를 수동으로 열어주세요."
    fi
fi

echo ""
echo "🎮 게임을 즐겨보세요!"
echo "Made with ❤️ and Amazon Q Developer"