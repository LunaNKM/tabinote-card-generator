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
  const limit = Math.min(Math.max(params.limit ?? 8, 1), 30);
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
        relevance: Math.max(0.45, 1 - index * 0.035)
      } satisfies ImageSearchResult;
    })
    .filter(isUsableImageResult);

  const unique = dedupeImageResults(normalized).slice(0, limit);
  return unique.length ? unique : mockImageResults(params.query, limit);
}

export function isUsableImageResult(item: ImageSearchResult) {
  const image = item.imageUrl.toLowerCase();
  const source = item.sourceUrl?.toLowerCase() ?? "";
  const combined = `${image} ${source}`;

  const blockedPatterns = [
    "lookaside.instagram.com",
    "lookaside.fbsbx.com",
    "facebook.com/photo",
    "instagram.com/p/",
    "instagram.com/reel/",
    "tiktok.com/api/img",
    "tiktokcdn.com",
    "tiktok.com/@",
    "tiktok.com/embed",
    "tiktok.com/oembed",
    "/crawler/",
    "google_widget/crawler",
    "encrypted-tbn0.gstatic.com"
  ];

  if (blockedPatterns.some((pattern) => combined.includes(pattern))) return false;

  // SerpAPI sometimes returns HTML/crawler endpoints as image URLs. Keep only likely media URLs.
  if (/\.(html?|php|aspx?)(\?|$)/i.test(image)) return false;

  // Avoid social API image endpoints that often render black in html-to-image/export.
  if (/(instagram|facebook|fbsbx|tiktok)/i.test(image) && !/\.(jpe?g|png|webp|gif)(\?|$)/i.test(image)) {
    return false;
  }

  return true;
}

export function makeImageSignature(url?: string | null) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const path = parsed.pathname.replace(/\/$/, "").toLowerCase();
    return `${host}${path}`;
  } catch {
    return url.toLowerCase().split("?")[0];
  }
}

export function dedupeImageResults(items: ImageSearchResult[]) {
  const seen = new Set<string>();
  const result: ImageSearchResult[] = [];

  for (const item of items) {
    const signature = makeImageSignature(item.imageUrl);
    if (!signature || seen.has(signature)) continue;
    seen.add(signature);
    result.push(item);
  }

  return result;
}

function buildQuery(query: string, preference?: SourcePreference) {
  const trimmed = query.trim();
  const exclusions = "-site:lookaside.instagram.com -site:lookaside.fbsbx.com -site:tiktok.com/api -site:tiktokcdn.com -site:facebook.com/photo";

  if (preference === "official") {
    return `${trimmed} 公式 official brand site ${exclusions}`;
  }

  if (preference === "retail") {
    return `${trimmed} 올리브영 다이소 롯데 쇼핑몰 공식 ${exclusions}`;
  }

  if (preference === "pinterest") {
    return `${trimmed} site:pinterest.com ${exclusions}`;
  }

  return `${trimmed} ${exclusions}`;
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
