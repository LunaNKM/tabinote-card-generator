# Tabinote 스타일 깨짐 복구 패치

## 원인
이전 설치 안정화/구조 수정 과정에서 Tailwind가 v4 계열(`tailwindcss@4`, `@tailwindcss/postcss`)로 바뀌었지만, 현재 프로젝트의 CSS와 설정은 Tailwind v3 방식(`@tailwind base; @tailwind components; @tailwind utilities;`, `tailwind.config.ts`)을 기준으로 작성되어 있습니다.

그 결과 Vercel 빌드는 통과해도 Tailwind utility class가 제대로 생성되지 않아 화면이 기본 HTML처럼 깨져 보였습니다.

## 수정
- `tailwindcss`를 `3.4.17`로 고정
- `@tailwindcss/postcss` 제거
- `postcss.config.js`를 Tailwind v3 방식으로 복구
- `latest` 의존성 제거 및 주요 패키지 버전 고정
- `.npmrc`에 `legacy-peer-deps=true` 추가
- `npm run build` 검증 완료

## 적용 파일
- package.json
- package-lock.json
- postcss.config.js
- .npmrc

## 적용 방법
1. 위 파일을 GitHub 저장소 루트에 덮어쓰기
2. Commit changes
3. Vercel Redeploy

주의: 이 패치를 적용한 뒤에는 이전의 `@tailwindcss/postcss` 기반 패치를 다시 덮어쓰지 마세요.
