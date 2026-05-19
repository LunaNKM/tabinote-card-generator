# ZIP 다운로드 먹통 복구 패치

## 원인
기존 다운로드 버튼은 사용자가 보는 270x360 미리보기 DOM을 직접 캡처하면서 `canvasWidth/canvasHeight`로 1080x1440 변환을 시도했습니다. 이 구조에서는 브라우저/이미지/폰트 로딩 상태에 따라 `html-to-image`가 조용히 실패하거나 오래 멈출 수 있습니다. 실패해도 UI 상태 표시가 없어 버튼이 먹통처럼 보였습니다.

## 수정 내용
1. 다운로드 클릭 시 1080x1440 export 전용 DOM을 임시 생성합니다.
2. export DOM에는 현재 store의 같은 slide 데이터를 렌더링합니다.
3. 렌더링 후 폰트와 이미지 로딩을 기다립니다.
4. 각 슬라이드를 PNG Blob으로 만든 뒤 ZIP으로 묶습니다.
5. 완료 또는 실패 후 임시 DOM을 즉시 제거합니다.
6. 버튼에 `PNG 생성 중...` 상태와 오류 메시지를 표시합니다.

## 적용 파일
- `components/generator/DownloadButton.tsx`

## 빌드 확인
- `npm run build` 통과 확인 완료
