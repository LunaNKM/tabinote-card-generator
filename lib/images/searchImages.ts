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

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const message = await res.text().catch(() => "");
    console.error("SerpAPI image search failed", res.status, message);
    return mockImageResults(params.query, limit);
  }

  const data = await res.json();
  const items: SerpApiImageResult[] = Array.isArray(data.images_results) ? data.images_results : [];

  const normalized = items
    .filter((item) => Boolean(item.original || item.thumbnail))
    .map((item, index) => {
      const imageUrl = item.original || item.thumbnail!;
      const sourceUrl = item.link || item.source || "https://serpapi.com";
      return {
        imageUrl,
        thumbnailUrl: item.thumbnail || item.original,
        sourceUrl,
        sourceLabel: normalizeSource(sourceUrl),
        width: item.original_width,
        height: item.original_height,
        relevance: Math.max(0.45, 1 - index * 0.04)
      } satisfies ImageSearchResult;
    })
    .filter(isUsableImageResult)
    .slice(0, limit);

  return normalized.length ? normalized : mockImageResults(params.query, limit);
}

function isUsableImageResult(item: ImageSearchResult) {
  const image = item.imageUrl.toLowerCase();
  const source = item.sourceUrl?.toLowerCase() ?? "";

  // These lookaside crawler URLs often return HTML or block hotlinking, causing black cards.
  const blockedPatterns = [
    "lookaside.instagram.com/seo/google_widget/crawler",
    "lookaside.fbsbx.com/lookaside/crawler/media",
    "facebook.com/photo",
    "instagram.com/p/"
  ];

  if (blockedPatterns.some((pattern) => image.includes(pattern))) return false;

  // Prefer the actual media file, not crawler/share pages.
  if (/\/crawler\//i.test(image)) return false;

  // If both image and source are clearly social crawler pages, reject.
  if ((image.includes("lookaside") || image.includes("crawler")) && /(instagram|facebook|fbsbx)/i.test(source)) {
    return false;
  }

  return true;
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

  return `${trimmed} -site:lookaside.instagram.com -site:lookaside.fbsbx.com`;
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
