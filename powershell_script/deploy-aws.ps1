# AWS 배포 스크립트
param(
    [Parameter(Mandatory=$true)]
    [string]$BucketName,
    
    [Parameter(Mandatory=$false)]
    [string]$Profile = "default"
)

Write-Host "🚀 AWS에 게임을 배포합니다..." -ForegroundColor Green
Write-Host "📦 버킷: $BucketName" -ForegroundColor Yellow

# AWS CLI 확인
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI가 설치되지 않았습니다." -ForegroundColor Red
    Write-Host "   https://aws.amazon.com/cli/ 에서 설치해주세요." -ForegroundColor Red
    exit 1
}

# 파일 동기화
Write-Host "📤 파일을 S3에 업로드합니다..." -ForegroundColor Cyan
aws s3 sync . s3://$BucketName --profile $Profile --exclude "*.ps1" --exclude "*.sh" --exclude "*.md" --exclude ".git/*"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 배포 완료!" -ForegroundColor Green
    Write-Host "🌐 웹사이트 URL: http://$BucketName.s3-website.ap-northeast-2.amazonaws.com" -ForegroundColor Magenta
} else {
    Write-Host "❌ 배포 실패" -ForegroundColor Red
}