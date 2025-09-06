#!/usr/bin/env pwsh

# AWS Cert Quest - 노들노들 이야기 게임 실행 스크립트
# PowerShell 버전

Write-Host "🌾 AWS 노들노들 이야기 게임을 시작합니다..." -ForegroundColor Green
Write-Host ""

# 현재 디렉토리 확인
$currentDir = Get-Location
Write-Host "📁 현재 위치: $currentDir" -ForegroundColor Yellow

# index.html 파일 존재 확인
if (-not (Test-Path "index.html")) {
    Write-Host "❌ index.html 파일을 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "   게임 폴더에서 스크립트를 실행해주세요." -ForegroundColor Red
    exit 1
}

# 사용 가능한 서버 옵션 확인 및 실행
Write-Host "🚀 로컬 서버를 시작합니다..." -ForegroundColor Cyan

# Python 확인
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
}

# Node.js 확인
$nodeAvailable = Get-Command node -ErrorAction SilentlyContinue
$npxAvailable = Get-Command npx -ErrorAction SilentlyContinue

if ($pythonCmd) {
    Write-Host "✅ Python을 사용하여 서버를 시작합니다." -ForegroundColor Green
    Write-Host "🌐 브라우저에서 http://localhost:8000 으로 접속하세요!" -ForegroundColor Magenta
    Write-Host "⏹️  서버를 중지하려면 Ctrl+C를 누르세요." -ForegroundColor Yellow
    Write-Host ""
    
    # 브라우저 자동 열기 (3초 후)
    Start-Job -ScriptBlock {
        Start-Sleep 3
        Start-Process "http://localhost:8000"
    } | Out-Null
    
    & $pythonCmd -m http.server 8000
    
} elseif ($npxAvailable) {
    Write-Host "✅ Node.js를 사용하여 서버를 시작합니다." -ForegroundColor Green
    Write-Host "🌐 브라우저에서 http://localhost:8080 으로 접속하세요!" -ForegroundColor Magenta
    Write-Host "⏹️  서버를 중지하려면 Ctrl+C를 누르세요." -ForegroundColor Yellow
    Write-Host ""
    
    # 브라우저 자동 열기 (3초 후)
    Start-Job -ScriptBlock {
        Start-Sleep 3
        Start-Process "http://localhost:8080"
    } | Out-Null
    
    npx http-server -p 8080
    
} else {
    Write-Host "⚠️  Python이나 Node.js를 찾을 수 없습니다." -ForegroundColor Yellow
    Write-Host "📖 대안 방법:" -ForegroundColor Cyan
    Write-Host "   1. Python 설치: https://python.org" -ForegroundColor White
    Write-Host "   2. Node.js 설치: https://nodejs.org" -ForegroundColor White
    Write-Host "   3. 또는 index.html을 브라우저로 직접 열기" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "index.html을 브라우저로 바로 열까요? (y/N)"
    if ($choice -eq "y" -or $choice -eq "Y") {
        Write-Host "🌐 브라우저에서 게임을 엽니다..." -ForegroundColor Green
        Start-Process (Join-Path $currentDir "index.html")
    }
}

Write-Host ""
Write-Host "🎮 게임을 즐겨보세요!" -ForegroundColor Green
Write-Host "Made with ❤️ and Amazon Q Developer" -ForegroundColor Magenta