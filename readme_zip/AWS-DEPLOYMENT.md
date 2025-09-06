# 🚀 AWS 배포 가이드

## 필수 준비사항

1. **AWS 계정** 생성
2. **AWS CLI** 설치: https://aws.amazon.com/cli/
3. **AWS 자격증명** 설정:
   ```bash
   aws configure
   ```

## 배포 방법

### 1단계: S3 버킷 생성

```bash
# 버킷 생성
aws s3 mb s3://your-game-bucket-name --region us-east-1

# 정적 웹사이트 호스팅 활성화
aws s3 website s3://your-game-bucket-name --index-document index.html
```

### 2단계: 게임 배포

**PowerShell:**
```powershell
.\deploy-aws.ps1 -BucketName "your-game-bucket-name"
```

**수동 업로드:**
```bash
aws s3 sync . s3://your-game-bucket-name --exclude "*.ps1" --exclude "*.sh" --exclude "*.md"
```

### 3단계: 퍼블릭 액세스 설정

1. **S3 콘솔** → 버킷 선택 → **권한** 탭
2. **퍼블릭 액세스 차단** → 편집 → 모든 체크 해제
3. **버킷 정책** 추가:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-game-bucket-name/*"
    }
  ]
}
```

## CloudFront 설정 (선택사항)

### 1. 배포 생성
- **Origin Domain**: your-game-bucket-name.s3.ap-northeast-2.amazonaws.com
- **Viewer Protocol Policy**: Redirect HTTP to HTTPS
- **Default Root Object**: index.html

### 2. 오류 페이지 설정
- **HTTP Error Code**: 404
- **Response Page Path**: /index.html
- **HTTP Response Code**: 200

## 접속 URL

- **S3 직접**: http://your-game-bucket-name.s3-website.us-east-1.amazonaws.com
- **CloudFront**: https://d1234567890.cloudfront.net

## 비용 예상

- **S3**: 월 $1-5 (트래픽에 따라)
- **CloudFront**: 월 $1-10 (글로벌 배포시)
- **Route 53**: 월 $0.5 (도메인 사용시)

## 삭제 방법

```bash
# 버킷 내용 삭제
aws s3 rm s3://your-game-bucket-name --recursive

# 버킷 삭제
aws s3 rb s3://your-game-bucket-name
```