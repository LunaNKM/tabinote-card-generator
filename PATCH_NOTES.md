# Build Fix Patch Notes

이 ZIP은 Vercel 빌드 실패를 막기 위해 문제가 날 가능성이 높은 파일만 수정한 패치입니다.

## 수정한 내용

1. `package.json`
   - `latest` 의존성을 제거하고 안정 버전으로 고정했습니다.
   - Tailwind CSS를 v3.4.17로 고정해 PostCSS 플러그인 충돌을 제거했습니다.
   - 누락되어 있던 `zod`, `file-saver`, `html-to-image`, 타입 패키지를 명시했습니다.
   - Next.js를 v14.2.23, React를 v18.3.1로 고정했습니다.

2. `postcss.config.js`
   - Tailwind v3 방식으로 고정했습니다.

3. `next.config.ts`
   - Next.js 14 기준으로 안정적으로 빌드되도록 정리했습니다.

4. `.env.example` / `README.md`
   - 이미지 검색 환경변수명을 `IMAGE_SEARCH_API_KEY`, `IMAGE_SEARCH_ENGINE_ID`로 통일했습니다.

5. `lib/images/searchImages.ts`
   - `.env`에서 안내했던 `IMAGE_SEARCH_API_KEY`, `IMAGE_SEARCH_ENGINE_ID`를 실제 코드에서 읽도록 수정했습니다.
   - 기존 `GOOGLE_SEARCH_API_KEY`, `GOOGLE_SEARCH_ENGINE_ID`도 fallback으로 지원합니다.

## GitHub 반영 방법

GitHub 저장소에서 같은 경로의 파일을 이 ZIP 안의 파일로 덮어쓴 뒤 `Commit changes`를 누르세요.
그 후 Vercel이 자동으로 다시 배포됩니다.
