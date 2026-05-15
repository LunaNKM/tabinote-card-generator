# Vercel npm install 안정화 패치

## 해결하는 문제
Vercel 배포 중 아래 오류가 발생하는 문제를 우회합니다.

```text
npm error Exit handler never called!
Command "npm install" exited with 1
```

## 원인
이전 패치 ZIP에 포함된 `package-lock.json`이 현재 실행 환경에서 생성된 lock 파일이라 Vercel의 npm 설치 과정에서 충돌할 수 있습니다. 또한 `latest` 의존성이 많아서 매 배포마다 설치 결과가 흔들릴 수 있습니다.

## 수정 내용
1. `package.json`의 모든 `latest` 제거
2. 의존성 버전 고정
3. `.npmrc`에서 lockfile 생성/사용을 끔
4. `vercel.json`에서 Vercel 설치 명령을 `npm install --no-package-lock --no-audit --no-fund`로 고정
5. Tailwind v4 PostCSS 설정 유지

## 적용 후 해야 할 일
GitHub 저장소에서 기존 `package-lock.json`은 삭제하는 것을 권장합니다.
삭제하지 않아도 `vercel.json`과 `.npmrc` 때문에 무시되도록 설정했지만, 혼선을 막기 위해 삭제하는 편이 안전합니다.
