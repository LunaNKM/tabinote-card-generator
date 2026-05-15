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

const BLOCKED_PATTERNS = [
  "lookaside.instagram.com",
  "lookaside.fbsbx.com",
  "facebook.com/photo",
  "instagram.com/p/",
  "instagram.com/reel/",
  "instagram.com/tv/",
  "tiktok.com/api/img",
  "tiktokcdn.com",
  "tiktok.com/@",
  "tiktok.com/embed",
  "tiktok.com/oembed",
  "/crawler/",
  "google_widget/crawler",
  "encrypted-tbn0.gstatic.com"
];

const STOPWORDS = new Set([
  "韓国", "한국", "ソウル", "서울", "旅行", "여행", "散歩", "ルート", "おすすめ", "人気", "ガチ",
  "写真", "画像", "スポット", "エリア", "観光", "place", "travel", "item", "trend", "cover", "cta",
  "の", "で", "を", "と", "に", "へ", "から", "まで", "route", "best", "top", "guide", "real"
]);

export async function searchImages(params: {
  query: string;
  sourcePreference?: SourcePreference;
  limit?: number;
}): Promise<ImageSearchResult[]> {
  const limit = Math.min(Math.max(params.limit ?? 8, 1), 30);
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    console.warn("[image-search] SERPAPI_API_KEY is missing. Returning no results.");
    return maybeMockResults(params.query, limit, "missing-key");
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
    console.error("[image-search] SerpAPI request failed", res.status, message);
    return maybeMockResults(params.query, limit, `http-${res.status}`);
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
        relevance: Math.max(0.45, 1 - index * 0.035),
        title: item.title || ""
      } satisfies ImageSearchResult;
    })
    .filter(isUsableImageResult);

  const unique = dedupeImageResults(normalized);
  const reranked = rerankByQuery(unique, params.query).slice(0, limit);

  if (!reranked.length) {
    console.warn("[image-search] No usable results", { query: params.query });
    return maybeMockResults(params.query, limit, "empty-results");
  }

  return reranked;
}

export function isUsableImageResult(item: ImageSearchResult) {
  const image = item.imageUrl.toLowerCase();
  const source = item.sourceUrl?.toLowerCase() ?? "";
  const combined = `${image} ${source}`;

  if (BLOCKED_PATTERNS.some((pattern) => combined.includes(pattern))) return false;
  if (/\.(html?|php|aspx?)(\?|$)/i.test(image)) return false;

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

function rerankByQuery(items: ImageSearchResult[], query: string) {
  return [...items].sort((a, b) => scoreForQuery(b, query) - scoreForQuery(a, query));
}

function scoreForQuery(item: ImageSearchResult, query: string) {
  const queryMatch = getQueryMatchScore(query, item);
  const resolution = getResolutionScore(item.width, item.height);
  const source = getSourceScore(item.sourceUrl);
  const base = item.relevance ?? 0.5;
  return base * 0.45 + queryMatch * 0.35 + resolution * 0.1 + source * 0.1;
}

function getQueryMatchScore(query: string, item: ImageSearchResult) {
  const tokens = tokenize(query);
  if (!tokens.length) return 0.5;

  const haystack = `${item.title ?? ""} ${item.sourceUrl ?? ""}`.toLowerCase();
  let matched = 0;

  for (const token of tokens) {
    if (haystack.includes(token)) matched += 1;
  }

  const ratio = matched / tokens.length;

  // If no token matched, do not fully discard the candidate because Google rank still matters.
  return Math.max(0.15, ratio);
}

function tokenize(input: string) {
  return Array.from(new Set(
    input
      .toLowerCase()
      .split(/[\s,，、/|()\[\]{}:;!?."'“”‘’~\-]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2 && !STOPWORDS.has(token))
  ));
}

function getResolutionScore(w?: number, h?: number) {
  if (!w || !h) return 0.5;
  const pixels = w * h;
  if (pixels >= 1080 * 1440) return 1;
  if (pixels >= 720 * 960) return 0.75;
  return 0.45;
}

function getSourceScore(url?: string) {
  if (!url) return 0.4;
  if (/official|oliveyoung|lotte|daiso|brand|instagram|naver|blog|visitseoul|korea/i.test(url)) return 0.85;
  if (/pinterest/i.test(url)) return 0.65;
  return 0.55;
}

function buildQuery(query: string, preference?: SourcePreference) {
  const trimmed = query.trim();
  const exclusions = [
    "-site:lookaside.instagram.com",
    "-site:lookaside.fbsbx.com",
    "-site:tiktok.com/api",
    "-site:tiktokcdn.com",
    "-site:facebook.com/photo",
    "-site:picsum.photos"
  ].join(" ");

  if (preference === "official") {
    return `${trimmed} 公式 official brand site ${exclusions}`;
  }

  if (preference === "retail") {
    return `${trimmed} 올리브영 다이소 롯데 쇼핑몰 공식 ${exclusions}`;
  }

  if (preference === "pinterest") {
    return `${trimmed} site:pinterest.com ${exclusions}`;
  }

  return `${trimmed} 実写 ${exclusions}`;
}

function maybeMockResults(query: string, limit: number, reason: string): ImageSearchResult[] {
  if (process.env.ALLOW_IMAGE_MOCKS === "true") {
    return Array.from({ length: limit }, (_, i) => ({
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(query)}-${i}/1080/1440`,
      thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(query)}-${i}/270/360`,
      sourceUrl: "https://picsum.photos",
      sourceLabel: "Photo | mock",
      width: 1080,
      height: 1440,
      relevance: 0.3,
      title: `mock-${reason}`
    }));
  }

  return [];
}
