# 노들노들 : Certi HERO ~ Cloud Castle~
Amazon Q Developer Hackathon 프로젝트의 일환으로    
재밌게 AWS Certifiction 내용을 학습하기 위한 게임 제작

## 어플리케이션 개요
AWS Certification을 위한 효과적인 학습을 위하여    
학습자의 성취도, 재미, 흥미를 유발하기 위해    
캐릭터화된 AWS 세계를 모험하며 여러 certification 문제를 풀고 캐릭터를 성장 시키는 게임.

## 주요 기능
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

### 구현된 AWS Certification
- **CP (Cloud Practitioner)**: 기초 AWS 개념
- **SAA (Solutions Architect Associate)**: 아키텍처 설계
- **SAP (Solutions Architect Professional)**: 고급 아키텍처

## 동영상 데모
(gif 데모)

## 리소스 배포하기
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

## 프로젝트 기대 효과 및 예상 사용 사례
* 재미와 학습을 동시에 추구