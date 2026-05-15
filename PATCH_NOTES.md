# Tabinote image relevance + no-fake-fallback patch

## What this patch fixes

1. **Removed the hardcoded Daiso query logic**
   - The previous patch accidentally forced travel topics to search with Daiso-related keywords.
   - This patch builds image queries from the actual project title, slide title, category, and slide type.

2. **Stops showing random mock images when search fails**
   - Before: if SerpAPI failed or returned nothing, the app silently used `picsum.photos`, which caused irrelevant forest/dog/random images.
   - Now: by default, failed search returns **no image**, and the card shows a clean dark background instead of fake/random photos.
   - If you explicitly want old behavior, set `ALLOW_IMAGE_MOCKS=true`.

3. **Improves query relevance for travel topics**
   - Travel cards now search with Seoul/travel/street/neighborhood keywords instead of beauty or Daiso keywords.
   - Each slide uses several fallback queries based on title + AI query + category.

4. **Keeps blocked social/crawler URLs out**
   - TikTok/Instagram/Facebook crawler and API image endpoints remain blocked.

5. **Prevents same image from repeating across multiple slides**
   - Duplicate image signatures are filtered at generation time.

## Files included
- `app/api/generate/route.ts`
- `app/api/search-images/route.ts`
- `components/cards/CardBackground.tsx`
- `lib/images/searchImages.ts`
- `lib/images/selectBestImage.ts`
- `types/image.ts`

## Important note
If your `SERPAPI_API_KEY` is missing or exhausted, the app will now show a dark background instead of unrelated random images.
That is intentional, because it makes the real failure obvious instead of hiding it.
