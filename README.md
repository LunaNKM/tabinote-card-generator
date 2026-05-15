# tabinote Card Generator Starter

내부용 tabinote 인스타 카드뉴스 자동 생성기 스타터 프로젝트입니다.

## 포함된 것

- Next.js + TypeScript + Tailwind 기본 구조
- tabinote 카드 디자인 컴포넌트
- 좌측 입력 패널 / 우측 미리보기 / 편집 패널
- GPT 기반 문안 생성 API 초안
- 이미지 검색 API 초안
- Supabase schema.sql
- 브라우저 기반 PNG ZIP 다운로드 기능

## 포함하지 않은 것

- PretendardJP 폰트 파일은 포함하지 않았습니다. 프로젝트 실행 전에 직접 `public/fonts/`에 넣어야 합니다.
- 실제 OpenAI API 키, Supabase 키, 이미지 검색 키는 포함하지 않았습니다.

## 폰트 준비

`app/globals.css`는 아래 파일명을 참조합니다.

```text
public/fonts/PretendardJP-Regular.woff2
public/fonts/PretendardJP-Medium.woff2
public/fonts/PretendardJP-Bold.woff2
public/fonts/PretendardJP-ExtraBold.woff2
```

현재 보유한 ttf/otf 파일을 woff2로 변환한 뒤 위 이름으로 넣으세요.
변환 없이 바로 쓰려면 globals.css의 `src` 경로와 format을 ttf 또는 otf로 바꿔도 됩니다.

## 설치

```bash
npm install
```

## 환경변수

`.env.example`을 복사해서 `.env.local`을 만드세요.

```bash
cp .env.example .env.local
```

필수 값:

```text
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.4
```

Supabase 저장을 쓰려면:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

이미지 검색을 실제로 쓰려면:

```text
IMAGE_SEARCH_API_KEY=
IMAGE_SEARCH_ENGINE_ID=
```

키가 없으면 mock 이미지와 mock 문안으로 동작합니다.

## Supabase DB 생성

Supabase SQL Editor에서 `supabase/schema.sql` 내용을 실행하세요.

## 실행

```bash
npm run dev
```

브라우저에서:

```text
http://localhost:3000
```

## 현재 MVP 상태

- 제목 입력 후 생성 가능
- OpenAI API 키가 없으면 mock 생성
- Google image search 키가 없으면 mock 이미지 생성
- 카드별 제목/본문/이미지 URL/출처 수정 가능
- ZIP 다운로드 가능

## 다음 개발 과제

1. 폰트 실제 적용 확인
2. 실제 이미지 검색 API 품질 개선
3. Supabase 프로젝트 불러오기/수정 저장 구현
4. 이미지 후보 리스트 UI 추가
5. 서버사이드 Playwright export 추가
6. Vercel 배포
