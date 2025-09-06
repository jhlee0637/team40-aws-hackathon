# 🔐 Access Key 없이 AWS 배포하기

## 🎯 상황 분석
- Access Key 발급 불가능
- AWS CLI 사용 불가
- AWS 콘솔에서만 작업 가능

## 📋 해결 방법 2가지

---

## 방법 1: S3 콘솔 직접 업로드 (권장)

### Step 1: S3 버킷 생성
1. **AWS 콘솔** → **S3** 서비스 접속
2. **버킷 만들기** 클릭
3. 설정:
   ```
   버킷 이름: aws-cert-quest-2024
   리전: us-east-1
   퍼블릭 액세스: 모든 차단 해제
   ```

### Step 2: 정적 웹사이트 호스팅 설정
1. 생성된 버킷 클릭
2. **속성** 탭 → **정적 웹 사이트 호스팅** → **편집**
3. 설정:
   ```
   정적 웹 사이트 호스팅: 활성화
   인덱스 문서: index.html
   오류 문서: index.html
   ```

### Step 3: 버킷 정책 설정
**권한** 탭 → **버킷 정책** → **편집**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::aws-cert-quest-2024/*"
    }
  ]
}
```

### Step 4: 파일 업로드 (콘솔에서)
1. **객체** 탭 → **업로드** 클릭
2. **파일 추가** 또는 **폴더 추가**
3. 업로드할 파일들:
   ```
   ✅ index.html (루트에)
   ✅ src/ 폴더 전체
   ✅ assets/ 폴더 전체
   ✅ 기타 필요한 파일들
   ```
4. **업로드** 클릭

### Step 5: 접속 확인
```
URL: http://aws-cert-quest-2024.s3-website.us-east-1.amazonaws.com
```

---

## 방법 2: EC2 + 웹서버 구성

### Step 1: EC2 인스턴스 생성
1. **AWS 콘솔** → **EC2** 서비스 접속
2. **인스턴스 시작** 클릭
3. 설정:
   ```
   AMI: Amazon Linux 2023
   인스턴스 유형: t2.micro (프리티어)
   키 페어: 새로 생성 또는 기존 사용
   보안 그룹: HTTP(80), HTTPS(443), SSH(22) 허용
   ```

### Step 2: 보안 그룹 설정
**인바운드 규칙**:
```
Type        Protocol    Port    Source
SSH         TCP         22      0.0.0.0/0
HTTP        TCP         80      0.0.0.0/0
HTTPS       TCP         443     0.0.0.0/0
```

### Step 3: EC2 접속 및 웹서버 설치
**EC2 Instance Connect** 또는 **SSH** 사용:

```bash
# 시스템 업데이트
sudo yum update -y

# Apache 웹서버 설치
sudo yum install -y httpd

# Apache 시작 및 자동 시작 설정
sudo systemctl start httpd
sudo systemctl enable httpd

# 웹 디렉토리 권한 설정
sudo chown -R ec2-user:ec2-user /var/www/html
```

### Step 4: 게임 파일 업로드 방법

#### 방법 4-1: 직접 파일 생성
```bash
# index.html 생성
nano /var/www/html/index.html
# (파일 내용을 복사-붙여넣기)

# 디렉토리 생성
mkdir -p /var/www/html/src
mkdir -p /var/www/html/assets

# JavaScript 파일들 생성
nano /var/www/html/src/stardew-fixed.js
# (파일 내용을 복사-붙여넣기)
```

#### 방법 4-2: GitHub 사용 (권장)
```bash
# Git 설치
sudo yum install -y git

# 프로젝트 클론 (GitHub에 업로드된 경우)
cd /var/www/html
sudo git clone https://github.com/your-username/team40-aws-hackathon.git .

# 또는 wget으로 파일 다운로드
wget https://raw.githubusercontent.com/your-repo/main/index.html
```

### Step 5: 접속 확인
```
URL: http://[EC2-퍼블릭-IP]
```

---

## 🚀 추천 방법: S3 콘솔 업로드

### 장점
- ✅ 설정이 간단함
- ✅ 비용이 저렴함 ($1-3/월)
- ✅ 확장성이 좋음
- ✅ CloudFront 연동 가능
- ✅ 관리가 쉬움

### 단점
- ❌ 파일을 하나씩 업로드해야 함
- ❌ 대량 파일 업로드 시 번거로움

---

## 📁 파일 업로드 순서 (S3 콘솔)

### 1단계: 루트 파일들
```
✅ index.html
✅ game.js (있다면)
✅ README.md (선택사항)
```

### 2단계: src 폴더
```
✅ src/stardew-fixed.js
✅ src/game.js
✅ src/quiz-data.js
✅ src/aws-config.js
✅ 기타 .js 파일들
```

### 3단계: assets 폴더
```
✅ assets/sprites/player.svg
✅ assets/sprites/npc.svg
✅ assets/sprites/monsters.svg
✅ assets/sprites/buildings.svg
```

### 4단계: 기타 폴더들
```
✅ css/ (있다면)
✅ images/ (있다면)
```

---

## 🔧 업로드 팁

### S3 콘솔 업로드 시
1. **폴더 구조 유지**: 폴더별로 나누어 업로드
2. **드래그 앤 드롭**: 여러 파일을 한 번에 선택 가능
3. **압축 파일**: ZIP으로 압축 후 업로드 → 압축 해제

### 파일 경로 확인
업로드 후 S3에서 파일 구조가 다음과 같아야 함:
```
aws-cert-quest-2024/
├── index.html
├── src/
│   ├── stardew-fixed.js
│   └── 기타 .js 파일들
└── assets/
    └── sprites/
        ├── player.svg
        └── 기타 .svg 파일들
```

---

## 🎯 최종 체크리스트

### S3 방법
- [ ] S3 버킷 생성 완료
- [ ] 정적 웹사이트 호스팅 활성화
- [ ] 버킷 정책 설정 완료
- [ ] 모든 파일 업로드 완료
- [ ] 웹사이트 URL 접속 테스트

### EC2 방법
- [ ] EC2 인스턴스 생성 완료
- [ ] 보안 그룹 설정 완료
- [ ] Apache 웹서버 설치 완료
- [ ] 게임 파일 업로드 완료
- [ ] 퍼블릭 IP로 접속 테스트

---

**💡 결론: S3 콘솔 업로드 방법을 권장합니다!**
**간단하고 안정적이며 비용 효율적입니다.**