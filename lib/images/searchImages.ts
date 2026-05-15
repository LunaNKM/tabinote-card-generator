import type { ImageSearchResult, SourcePreference } from "@/types/image";
import { normalizeSource } from "./normalizeSource";

type SerpApiImageResult = {
  title?: string;
  original?: string;
  thumbnail?: string;
  source?: string;
  link?: string;
  original_width?: number;
  original_height?: number;
  position?: number;
};

export async function searchImages(params: {
  query: string;
  sourcePreference?: SourcePreference;
  limit?: number;
}): Promise<ImageSearchResult[]> {
  const limit = Math.min(Math.max(params.limit ?? 8, 1), 20);
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    return mockImageResults(params.query, limit);
  }

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_images");
  url.searchParams.set("q", buildQuery(params.query, params.sourcePreference));
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("hl", "ja");
  url.searchParams.set("gl", "jp");
  url.searchParams.set("safe", "active");

  const res = await fetch(url, {
    // Vercel/Next.js 서버에서 너무 오래 캐시하지 않도록 설정
    cache: "no-store"
  });

  if (!res.ok) {
    const message = await res.text().catch(() => "");
    console.error("SerpAPI image search failed", res.status, message);
    return mockImageResults(params.query, limit);
  }

  const data = await res.json();
  const items: SerpApiImageResult[] = Array.isArray(data.images_results)
    ? data.images_results
    : [];

  const normalized = items
    .filter((item) => Boolean(item.original || item.thumbnail))
    .slice(0, limit)
    .map((item, index) => {
      const sourceUrl = item.link || item.source || "https://serpapi.com";
      return {
        imageUrl: item.original || item.thumbnail!,
        thumbnailUrl: item.thumbnail || item.original,
        sourceUrl,
        sourceLabel: normalizeSource(sourceUrl),
        width: item.original_width,
        height: item.original_height,
        relevance: Math.max(0.45, 1 - index * 0.04)
      } satisfies ImageSearchResult;
    });

  return normalized.length ? normalized : mockImageResults(params.query, limit);
}

function buildQuery(query: string, preference?: SourcePreference) {
  const trimmed = query.trim();

  if (preference === "official") {
    return `${trimmed} 공식 official brand site`;
  }

  if (preference === "retail") {
    return `${trimmed} 올리브영 다이소 롯데 쇼핑몰 공식`;
  }

  if (preference === "pinterest") {
    return `${trimmed} site:pinterest.com`;
  }

  return trimmed;
}

function mockImageResults(query: string, limit: number): ImageSearchResult[] {
  return Array.from({ length: limit }, (_, i) => ({
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(query)}-${i}/1080/1440`,
    thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(query)}-${i}/270/360`,
    sourceUrl: "https://picsum.photos",
    sourceLabel: "Photo | mock",
    width: 1080,
    height: 1440,
    relevance: 0.3
  }));
}
