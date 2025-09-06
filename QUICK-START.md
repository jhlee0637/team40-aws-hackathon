# 🚀 빠른 시작 가이드

## Windows에서 실행

1. **PowerShell 열기** (관리자 권한 권장)
2. **게임 폴더로 이동**:
   ```powershell
   cd "경로\team40-aws-hackathon"
   ```
3. **게임 실행**:
   ```powershell
   .\start-game.ps1
   ```

## Linux/Mac에서 실행

1. **터미널 열기**
2. **게임 폴더로 이동**:
   ```bash
   cd /path/to/team40-aws-hackathon
   ```
3. **실행 권한 부여** (최초 1회):
   ```bash
   chmod +x start-game.sh
   ```
4. **게임 실행**:
   ```bash
   ./start-game.sh
   ```

## 문제 해결

### PowerShell 실행 정책 오류
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 브라우저가 자동으로 열리지 않는 경우
- 수동으로 `http://localhost:8000` 접속

### Python/Node.js가 없는 경우
- Python: https://python.org 에서 다운로드
- Node.js: https://nodejs.org 에서 다운로드

---
**🎮 즐거운 게임 되세요!**