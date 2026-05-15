# Tabinote 구조 수정 패치

## 핵심 변경

1. **다운로드 전용 숨김 렌더 트리 제거**
   - 기존: 미리보기 DOM + 숨김 export DOM 이중 구조
   - 변경: **사용자가 보고 있는 미리보기 카드 그 자체를 캡처**
   - 효과: 미리보기/다운로드 불일치 원인을 구조적으로 차단

2. **이미지 고정(freeze) 레이어 추가**
   - 생성 직후 원격 이미지를 `/api/image-proxy`를 통해 가져와 **data URL로 고정**
   - 이후 미리보기와 다운로드는 모두 같은 고정 이미지 사용
   - 효과: 재로딩/재요청/프록시 응답 차이로 다른 사진이 섞이는 문제 방지

3. **안정적 다운로드 대기 로직 추가**
   - 다운로드 전에 폰트 로딩 완료 대기
   - 각 카드 내부 `<img>` decode/load 완료 대기
   - 효과: 일부 카드만 다른 상태로 저장되는 레이스 컨디션 방지

4. **랜덤 mock 기본 제거 유지**
   - 새 로컬 슬라이드 추가 시에도 더 이상 랜덤 이미지가 들어가지 않음

## 덮어쓸 파일
- app/api/image-proxy/route.ts
- lib/images/freezeSlidesForRender.ts
- store/generatorStore.ts
- types/slide.ts
- components/cards/CardBackground.tsx
- components/cards/InstagramCard.tsx
- components/layout/PreviewPanel.tsx
- components/generator/DownloadButton.tsx

## 적용 후 기대 효과
- 화면에서 본 카드와 다운로드 결과가 동일해야 함
- 다운로드 시 다른 사진으로 바뀌는 현상이 구조적으로 크게 줄어듦
- 숨김 export DOM 때문에 생기던 상태 불일치가 사라짐
