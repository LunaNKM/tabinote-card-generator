# Tabinote full image/export stability patch

## Fixed issues

### 1. Preview/download mismatch
- Removed hidden duplicate export cards from `PreviewPanel`.
- `DownloadButton` now captures the exact same 1080x1440 card frame used inside preview.
- This prevents preview and downloaded PNG from loading different remote images.

### 2. Repeated image issue
- Generation keeps a project-level `usedImageSignatures` set.
- The same image URL cannot be selected repeatedly across slides unless there are truly no alternatives.

### 3. Irrelevant travel images
- Removed topic-agnostic fallback behavior.
- Travel image queries now focus on specific place names such as 聖水, 西村, 延南洞, 漢南, 梨泰院, 弘大, 安国, etc.
- Route/map words are excluded from image search so maps/screenshots are less likely to appear.

### 4. Mock/random image hiding real problems
- Random `picsum.photos` fallback is disabled by default.
- If SerpAPI fails, returns empty, or API key is missing, the card uses a clean black background instead of unrelated random images.
- To intentionally re-enable mock images for local testing, set `ALLOW_IMAGE_MOCKS=true`.

### 5. Hotlink/crawler blocked images
- TikTok/Instagram/Facebook crawler/API image endpoints remain blocked.
- Image rendering still goes through `/api/image-proxy` for safer html-to-image export.

## Files included
- `app/api/generate/route.ts`
- `app/api/search-images/route.ts`
- `app/api/image-proxy/route.ts`
- `components/cards/CardBackground.tsx`
- `components/cards/InstagramCard.tsx`
- `components/generator/DownloadButton.tsx`
- `components/layout/PreviewPanel.tsx`
- `lib/images/searchImages.ts`
- `lib/images/selectBestImage.ts`
- `types/image.ts`

## Required env
- `SERPAPI_API_KEY` must be set in Vercel.
- Do not set `ALLOW_IMAGE_MOCKS=true` in production unless you want random placeholder images.
