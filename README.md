# AWS 퀴즈 RPG

AWS 자격증 학습을 위한 인터랙티브 퀴즈 게임  
노들섬에서 AWS 서비스들과 퀴즈 배틀로 실력 향상

## 🎮 게임 개요

AWS 자격증 취득을 위한 학습을 게임화한 RPG입니다. 플레이어는 노들섬을 탐험하며 AWS 서비스 몬스터들과 퀴즈 배틀을 통해 AWS 지식을 습득합니다.

### 주요 특징
- **인터랙티브 학습**: 게임을 통한 AWS 지식 습득
- **퀴즈 배틀**: AWS 서비스와의 지식 대결
- **자격증 대비**: CP, SAA, DVA, SAP 단계별 문제
- **모듈화 구조**: ES6 모듈 기반 확장 가능한 아키텍처

## 🚀 빠른 시작

```bash
# 로컬 실행
npm start

# 또는
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000` 접속

## 🏗️ 아키텍처

### 핵심 개선사항
1. **모듈 분리**: 5개 클래스로 책임 분리 (ES6 모듈)
2. **성능 최적화**: 뷰포트 컬링으로 60fps 달성
3. **데이터 외부화**: JSON 기반 퀴즈/엔티티 관리
4. **AWS 연동**: S3+CloudFront+DynamoDB 아키텍처

### 모듈 구조
```
src/
├── main.js              # 메인 엔트리 포인트
├── core/
│   ├── GameEngine.js    # 게임 로직 관리
│   ├── Renderer.js      # 최적화된 렌더링
│   └── InputManager.js  # 입력 처리
├── systems/
│   └── BattleSystem.js  # 퀴즈 배틀 시스템
└── data/
    └── DataManager.js   # JSON 데이터 관리
```

## 🎯 게임플레이

### 조작법
- **이동**: A/D 키 (좌우 이동)
- **점프**: Space 키
- **퀴즈 배틀**: AWS 서비스 몬스터와 충돌 시 자동 시작
- **정답 선택**: 마우스 클릭

### 진행 방식
1. 노들섬 탐험
2. AWS 서비스 몬스터 발견
3. 퀴즈 배틀 시작
4. 정답 시 경험치/크레딧 획득
5. 레벨업으로 더 어려운 문제 도전

## 📚 학습 콘텐츠

- **CP (Cloud Practitioner)**: 기초 AWS 개념
- **SAA (Solutions Architect Associate)**: 아키텍처 설계
- **DVA (Developer Associate)**: 개발자 도구
- **SAP (Solutions Architect Professional)**: 고급 아키텍처

## ☁️ AWS 배포

### S3 정적 웹사이트
```bash
# 데이터 번들링
npm run bundle

# S3 배포
aws s3 mb s3://aws-certi-rpg
npm run deploy
aws s3 website s3://aws-certi-rpg --index-document index.html
```

### CloudFront CDN
```bash
# CloudFront 배포 생성 (AWS CLI 또는 콘솔)
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## 🔧 개발

### 데이터 수정
1. `data/` 폴더의 JSON 파일 편집
2. `npm run bundle` 실행
3. 게임 재시작

### 새 몬스터 추가
```json
// data/entities/monsters.json
{
  "id": 5,
  "name": "DynamoDB 테이블",
  "level": 2,
  "sprite": "dynamodb",
  "quizCategory": "dva"
}
```

### 새 퀴즈 추가
```json
// data/quiz/saa.json
{
  "question": "새로운 AWS 질문",
  "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
  "correctAnswer": 0,
  "explanation": "정답 설명"
}
```

## 📈 성능 최적화

- **뷰포트 컬링**: 화면에 보이는 객체만 렌더링
- **오브젝트 풀링**: 메모리 재사용으로 GC 최소화
- **데이터 번들링**: 네트워크 요청 최소화
- **이미지 최적화**: 픽셀 아트 압축

## 🎨 아트 스타일

- **16비트 픽셀 아트**: 스타듀밸리 스타일
- **32x32 타일**: 표준 타일 크기
- **제한된 팔레트**: 일관된 색상 테마
- **애니메이션**: 부드러운 캐릭터 움직임

## 🤝 기여하기

1. Fork the repository
2. Create feature branch
3. Add new quiz questions or monsters
4. Submit pull request

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능