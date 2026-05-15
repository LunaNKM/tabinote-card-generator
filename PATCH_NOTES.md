# tabinote image preview/export sync patch

## 수정 내용

1. 미리보기와 다운로드 결과가 달라지는 문제 수정
   - 이제 미리보기는 1080×1440 실제 카드 컴포넌트를 0.25배 축소해서 보여줍니다.
   - 다운로드도 같은 컴포넌트를 그대로 사용합니다.

2. 외부 이미지 CORS/핫링크 문제 수정
   - `/api/image-proxy`를 추가했습니다.
   - 카드 배경 이미지는 직접 외부 URL을 물지 않고, 동일 도메인 프록시를 거쳐 불러옵니다.
   - html-to-image 다운로드 시 외부 이미지 때문에 누락되는 문제를 줄입니다.

3. Instagram/Facebook lookaside crawler URL 필터링
   - 아래 형태의 URL은 실제 이미지가 아니라 crawler/share 페이지라 검정 배경으로 나오는 경우가 많습니다.
   - SerpAPI 결과에서 자동 제외합니다.
   - `lookaside.instagram.com/seo/google_widget/crawler`
   - `lookaside.fbsbx.com/lookaside/crawler/media`

4. ZIP 다운로드 안정화
   - 이미지 로딩 완료를 기다린 뒤 PNG를 생성합니다.
   - 다운로드 버튼에 `PNG 생성 중...` 상태를 추가했습니다.

## 적용 방법

ZIP 안의 파일을 GitHub 저장소의 같은 위치에 덮어쓴 뒤 Commit changes를 누르고 Vercel에서 재배포하세요.
