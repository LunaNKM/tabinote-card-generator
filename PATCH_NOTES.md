# SerpAPI 이미지 검색 전환 패치

## 변경 내용

- Google Custom Search JSON API 사용 코드를 제거하고 SerpAPI Google Images 방식으로 변경했습니다.
- 환경변수는 `SERPAPI_API_KEY` 하나만 사용합니다.
- Google 관련 환경변수 `IMAGE_SEARCH_API_KEY`, `IMAGE_SEARCH_ENGINE_ID`, `GOOGLE_SEARCH_API_KEY`, `GOOGLE_SEARCH_ENGINE_ID`는 더 이상 사용하지 않습니다.
- 이미지 검색 실패 시 앱이 멈추지 않도록 mock 이미지로 fallback 처리합니다.
- `next.config.js`를 포함했습니다. 기존 `next.config.ts`는 삭제해야 합니다.
- `package.json`은 Tailwind v3, Next.js 14 안정 조합으로 고정했습니다.

## 적용 방법

1. ZIP 안의 파일을 GitHub 저장소의 같은 경로에 덮어쓰기
2. GitHub 저장소 최상단의 `next.config.ts` 삭제
3. Vercel Environment Variables에서 아래 값 추가

```env
SERPAPI_API_KEY=SerpAPI에서 복사한 API Key
```

4. 기존 Google 이미지 검색 관련 환경변수는 비워두거나 삭제
5. Vercel에서 Redeploy

## SerpAPI 키 확인

SerpAPI Dashboard에서 API Key를 복사해 Vercel에 넣으면 됩니다.
