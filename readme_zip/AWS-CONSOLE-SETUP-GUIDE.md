# 🚀 AWS 콘솔 설정 완벽 가이드

## 📋 사전 준비
- AWS 계정 생성 완료
- AWS 콘솔 로그인: https://console.aws.amazon.com

---

## 1️⃣ S3 버킷 생성 및 설정

### Step 1-1: S3 서비스 접속
1. AWS 콘솔 상단 검색창에 **"S3"** 입력
2. **Amazon S3** 클릭

### Step 1-2: 버킷 생성
1. **버킷 만들기** 버튼 클릭
2. 다음 정보 입력:
   ```
   버킷 이름: aws-cert-quest-2024
   AWS 리전: 미국 동부(버지니아 북부) us-east-1
   ```

### Step 1-3: 퍼블릭 액세스 설정
1. **이 버킷의 퍼블릭 액세스 차단 설정** 섹션에서:
   ```
   ☐ 새 액세스 제어 목록(ACL)을 통해 부여된 버킷 및 객체에 대한 퍼블릭 액세스 차단
   ☐ 임의의 액세스 제어 목록(ACL)을 통해 부여된 버킷 및 객체에 대한 퍼블릭 액세스 차단
   ☐ 새 퍼블릭 버킷 또는 액세스 지점 정책을 통해 부여된 버킷 및 객체에 대한 퍼블릭 액세스 차단
   ☐ 임의의 퍼블릭 버킷 또는 액세스 지점 정책을 통해 부여된 버킷 및 객체에 대한 퍼블릭 및 교차 계정 액세스 차단
   ```
   **모든 체크박스 해제**

2. **버킷 만들기** 클릭

### Step 1-4: 정적 웹사이트 호스팅 활성화
1. 생성된 버킷(**aws-cert-quest-2024**) 클릭
2. **속성** 탭 클릭
3. 맨 아래 **정적 웹 사이트 호스팅** 섹션에서 **편집** 클릭
4. 다음 설정:
   ```
   정적 웹 사이트 호스팅: 활성화
   호스팅 유형: 정적 웹 사이트 호스팅
   인덱스 문서: index.html
   오류 문서: index.html
   ```
5. **변경 사항 저장** 클릭

### Step 1-5: 버킷 정책 설정
1. **권한** 탭 클릭
2. **버킷 정책** 섹션에서 **편집** 클릭
3. 다음 JSON 정책 붙여넣기:
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
4. **변경 사항 저장** 클릭

### Step 1-6: 게임 파일 업로드
1. **객체** 탭 클릭
2. **업로드** 버튼 클릭
3. **파일 추가** 또는 **폴더 추가**로 다음 파일들 선택:
   ```
   ✅ index.html
   ✅ src/ 폴더 (모든 .js 파일 포함)
   ✅ assets/ 폴더 (모든 이미지 파일 포함)
   ✅ css/ 폴더 (있다면)
   ```
4. **업로드** 클릭

---

## 2️⃣ CloudFront 배포 생성

### Step 2-1: CloudFront 서비스 접속
1. AWS 콘솔 상단 검색창에 **"CloudFront"** 입력
2. **Amazon CloudFront** 클릭

### Step 2-2: 배포 생성
1. **배포 생성** 버튼 클릭
2. **Origin** 섹션 설정:
   ```
   Origin domain: aws-cert-quest-2024.s3.us-east-1.amazonaws.com
   Origin path: (비워둠)
   Name: aws-cert-quest-2024.s3.us-east-1.amazonaws.com
   Origin access: Public
   ```

### Step 2-3: 기본 캐시 동작 설정
```
Viewer protocol policy: Redirect HTTP to HTTPS
Allowed HTTP methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
Cache policy: Managed-CachingOptimized
Origin request policy: None
Response headers policy: None
```

### Step 2-4: 설정 완료
```
Price class: Use all edge locations (best performance)
Alternate domain name (CNAME): (비워둠)
Custom SSL certificate: Default CloudFront Certificate
Default root object: index.html
Description: AWS Cert Quest Game Distribution
```

### Step 2-5: 배포 생성
1. **배포 생성** 클릭
2. 배포 상태가 **Deployed**가 될 때까지 대기 (5-10분)

### Step 2-6: 오류 페이지 설정
1. 생성된 배포 클릭
2. **오류 페이지** 탭 클릭
3. **사용자 지정 오류 응답 생성** 클릭
4. 다음 설정:
   ```
   HTTP 오류 코드: 404: Not Found
   오류 캐싱 최소 TTL: 300
   사용자 지정 오류 응답: 예
   응답 페이지 경로: /index.html
   HTTP 응답 코드: 200: OK
   ```
5. **생성** 클릭

---

## 3️⃣ Route 53 도메인 설정 (선택사항)

### Step 3-1: 도메인 구매 (선택)
1. AWS 콘솔에서 **Route 53** 검색
2. **도메인 등록** → **도메인 등록**
3. 원하는 도메인명 검색 (예: `aws-cert-quest.com`)
4. 구매 진행

### Step 3-2: 호스팅 영역 생성
1. **호스팅 영역** → **호스팅 영역 생성**
2. 도메인 이름 입력: `aws-cert-quest.com`
3. **생성** 클릭

### Step 3-3: A 레코드 생성
1. 생성된 호스팅 영역 클릭
2. **레코드 생성** 클릭
3. 다음 설정:
   ```
   레코드 이름: (비워둠 - 루트 도메인)
   레코드 유형: A
   별칭: 예
   트래픽 라우팅 대상: CloudFront 배포에 대한 별칭
   리전: 해당 없음
   배포: 위에서 생성한 CloudFront 배포 선택
   ```
4. **레코드 생성** 클릭

---

## 4️⃣ Certificate Manager SSL 인증서 (선택사항)

### Step 4-1: 인증서 요청
1. AWS 콘솔에서 **Certificate Manager** 검색
2. **리전이 us-east-1 (버지니아 북부)인지 확인** (CloudFront용)
3. **인증서 요청** 클릭
4. 다음 설정:
   ```
   인증서 유형: 퍼블릭 인증서 요청
   도메인 이름: aws-cert-quest.com
   추가 이름: www.aws-cert-quest.com
   검증 방법: DNS 검증
   ```
5. **요청** 클릭

### Step 4-2: DNS 검증
1. 생성된 인증서 클릭
2. **Route 53에서 레코드 생성** 클릭
3. 검증 완료까지 대기 (5-30분)

### Step 4-3: CloudFront에 SSL 적용
1. CloudFront 배포로 돌아가기
2. **편집** 클릭
3. **사용자 지정 SSL 인증서** 선택
4. 위에서 생성한 인증서 선택
5. **변경 사항 저장** 클릭

---

## 🎯 최종 확인 및 접속

### 접속 URL 확인
1. **S3 직접 접속**: 
   ```
   http://aws-cert-quest-2024.s3-website.us-east-1.amazonaws.com
   ```

2. **CloudFront 접속**:
   ```
   https://d1234567890.cloudfront.net (배포 도메인명)
   ```

3. **커스텀 도메인** (설정한 경우):
   ```
   https://aws-cert-quest.com
   ```

### 테스트 체크리스트
- [ ] 게임 페이지가 정상 로드되는가?
- [ ] 모든 이미지와 스크립트가 로드되는가?
- [ ] 게임이 정상 작동하는가?
- [ ] HTTPS 접속이 가능한가?

---

## 💰 예상 비용

| 서비스 | 월 예상 비용 |
|--------|-------------|
| S3 | $1-3 |
| CloudFront | $1-5 |
| Route 53 | $0.5 |
| Certificate Manager | 무료 |
| **총합** | **$2.5-8.5** |

---

## 🗑️ 리소스 삭제 방법

### S3 삭제
1. 버킷 → 모든 객체 선택 → 삭제
2. 버킷 삭제

### CloudFront 삭제
1. 배포 → 비활성화 → 삭제

### Route 53 삭제
1. 호스팅 영역 → 레코드 삭제 → 호스팅 영역 삭제

---

**🎮 설정 완료 후 전 세계 어디서나 빠르게 게임을 즐길 수 있습니다!**