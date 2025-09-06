# ✅ AWS 배포 체크리스트

## 🎯 필수 단계 (S3 + CloudFront)

### S3 설정
- [ ] S3 버킷 생성: `aws-cert-quest-2024`
- [ ] 리전 선택: `us-east-1` (버지니아 북부)
- [ ] 퍼블릭 액세스 차단 **모두 해제**
- [ ] 정적 웹사이트 호스팅 **활성화**
  - [ ] 인덱스 문서: `index.html`
  - [ ] 오류 문서: `index.html`
- [ ] 버킷 정책 추가 (JSON)
- [ ] 게임 파일 업로드
  - [ ] `index.html`
  - [ ] `src/` 폴더
  - [ ] `assets/` 폴더

### CloudFront 설정
- [ ] 배포 생성
- [ ] Origin: S3 버킷 선택
- [ ] Viewer Protocol: **Redirect HTTP to HTTPS**
- [ ] Default Root Object: `index.html`
- [ ] 배포 상태: **Deployed** 확인
- [ ] 404 오류 페이지 → `/index.html` 리다이렉트

## 🔧 선택 단계

### Route 53 (커스텀 도메인)
- [ ] 도메인 구매
- [ ] 호스팅 영역 생성
- [ ] A 레코드 → CloudFront 별칭

### Certificate Manager (SSL)
- [ ] **us-east-1** 리전에서 인증서 요청
- [ ] DNS 검증 완료
- [ ] CloudFront에 SSL 인증서 적용

## 🧪 테스트

### 기능 테스트
- [ ] S3 URL 접속 테스트
- [ ] CloudFront URL 접속 테스트
- [ ] 게임 로딩 확인
- [ ] 모든 리소스 로딩 확인
- [ ] 게임 플레이 테스트

### 성능 테스트
- [ ] 페이지 로딩 속도 확인
- [ ] 모바일 접속 테스트
- [ ] 다른 지역에서 접속 테스트

## 📊 모니터링 설정

### CloudWatch (선택)
- [ ] S3 메트릭 활성화
- [ ] CloudFront 메트릭 확인
- [ ] 알람 설정

## 🎯 최종 URL

```
S3 직접: http://aws-cert-quest-2024.s3-website.us-east-1.amazonaws.com
CloudFront: https://[distribution-id].cloudfront.net
커스텀 도메인: https://your-domain.com
```

## 💡 문제 해결

### 일반적인 문제
- [ ] 403 Forbidden → 버킷 정책 확인
- [ ] 404 Not Found → 파일 경로 확인
- [ ] Mixed Content → HTTPS 사용 확인
- [ ] 캐시 문제 → CloudFront 무효화

### 디버깅 도구
- [ ] 브라우저 개발자 도구 → Network 탭
- [ ] S3 액세스 로그 확인
- [ ] CloudFront 로그 확인

---

**🚀 모든 체크리스트 완료 시 게임이 전 세계에서 접속 가능합니다!**