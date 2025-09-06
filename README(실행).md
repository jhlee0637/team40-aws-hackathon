# 🎮 AWS Cert Quest - 노들섬 픽셀 RPG

노들섬을 배경으로 한 포켓몬 스타일의 AWS 자격증 학습 게임입니다.

## 📁 프로젝트 구조

```
hackthon_Q/
├── assets/
│   └── sprites/           # 16x16 픽셀 아트 스프라이트
│       ├── player.svg     # 플레이어 애니메이션 스프라이트
│       ├── npc.svg        # AWS 자격증 마스터 NPC들
│       ├── monsters.svg   # AWS 테마 몬스터들
│       └── buildings.svg  # 노들섬 건물들
├── src/
│   ├── game.js           # 메인 게임 로직
│   ├── sprite-manager.js # SVG 스프라이트 관리자
│   ├── quiz-data.js      # AWS 퀴즈 데이터베이스
│   └── aws-config.js     # AWS 서비스 설정
├── css/
│   └── style.css         # 현대적인 게임 스타일
├── index.html            # 메인 게임 페이지
└── README.md
```

## 🎯 게임 특징

### 🎨 16x16 픽셀 아트
- **노들섬 테마**: 서울의 노들섬을 배경으로 한 독특한 설정
- **SVG 스프라이트**: 확장 가능한 벡터 기반 픽셀 아트
- **부드러운 애니메이션**: 4프레임 걷기 애니메이션
- **픽셀 퍼펙트**: 크리스프한 픽셀 렌더링

### 🗺️ 맵 시스템
- **마을**: 누들누들 센터, 플레이어 집, AWS 상점
- **1번 도로**: 풀숲과 AWS 마스터들이 있는 모험 지역
- **누들누들 센터**: 포켓몬 센터를 패러디한 치료 시설
- **자연스러운 맵 전환**: 문을 통한 부드러운 화면 전환

### 🎮 포켓몬 스타일 게임플레이
- **탑뷰 오버월드**: 위에서 내려다보는 클래식한 시점
- **랜덤 인카운터**: 풀숲에서 걸으면 몬스터 조우
- **배틀 화면 전환**: 포켓몬처럼 화면이 전환되는 배틀
- **레벨 시스템**: EXP 획득으로 성장하는 캐릭터

## 🏆 수집 가능한 AWS 자격증

- **CP**: Cloud Practitioner (입문)
- **SAA**: Solutions Architect Associate
- **DVA**: Developer Associate
- **SOA**: SysOps Administrator Associate
- **SAP**: Solutions Architect Professional
- **DOP**: DevOps Engineer Professional

## 👾 AWS 테마 몬스터들

- **Bug Goomba** (Lv.1): 코딩 버그를 상징하는 갈색 몬스터
- **Code Koopa** (Lv.2): 초록 껍질을 가진 코드 거북이
- **Lambda Lizard** (Lv.3): AWS Lambda를 상징하는 빨간 도마뱀
- **S3 Slime** (Lv.2): 파란색 S3 스토리지 슬라임
- **EC2 Eagle** (Lv.4): 황금색 EC2 독수리
- **VPC Viper** (Lv.5): 보라색 VPC 바이퍼

## 🎮 조작법

- **화살표 키**: 캐릭터 이동 (걷기 애니메이션)
- **자동 상호작용**: 문, NPC, 치료대 근처에서 자동 실행
- **스페이스바**: 누들누들 센터에서 HP 회복
- **마우스 클릭**: 퀴즈 답변 선택

## 🚀 실행 방법

### 🎯 원클릭 실행 (권장)

**PowerShell (Windows):**
```powershell
.\start-game.ps1
```

**Bash (Linux/Mac):**
```bash
./start-game.sh
```

### 🛠 수동 실행

1. **로컬 서버 실행**:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server
   ```

2. **브라우저 접속**: `http://localhost:8000`

3. **직접 실행**: `index.html` 파일을 브라우저로 열기 (일부 기능 제한)

## 🛠 기술 스택

- **Frontend**: HTML5 Canvas, Vanilla JavaScript
- **Graphics**: SVG 기반 16x16 픽셀 아트
- **Animation**: 커스텀 스프라이트 애니메이션 시스템
- **Storage**: LocalStorage (MVP)
- **Future**: AWS DynamoDB, S3, Amplify

## 🎨 스프라이트 시스템

### SVG 기반 픽셀 아트
- 16x16 픽셀 기본 크기
- 벡터 기반으로 확장 가능
- 4방향 애니메이션 지원
- 모듈화된 스프라이트 관리

### 애니메이션 프레임
```javascript
// 플레이어 애니메이션 예시
down-0, down-1, down-2, down-3  // 아래쪽 보기
up-0, up-1, up-2, up-3          // 위쪽 보기
left-0, left-1, left-2, left-3  // 왼쪽 보기
right-0, right-1, right-2, right-3 // 오른쪽 보기
```

## 📚 학습 효과

- **AWS 핵심 서비스**: 실제 자격증 문제 기반 학습
- **게임화 학습**: 재미있는 RPG 요소로 동기부여
- **단계적 난이도**: 레벨에 따른 점진적 학습
- **반복 학습**: 몬스터 배틀을 통한 자연스러운 복습

## 🔮 향후 계획

- [ ] 더 많은 맵과 지역 추가
- [ ] 추가 AWS 서비스 몬스터
- [ ] 멀티플레이어 기능
- [ ] 모바일 반응형 지원
- [ ] AWS 실제 서비스 연동
- [ ] 리더보드 시스템

## 🤝 기여하기

새로운 스프라이트, 퀴즈 문제, 기능 개선 아이디어 환영합니다!

---

**Made with ❤️ and Amazon Q Developer**
**노들섬의 AWS 모험을 즐겨보세요! 🏝️**