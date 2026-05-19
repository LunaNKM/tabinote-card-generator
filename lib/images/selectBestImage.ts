import type { ImageSearchResult } from "@/types/image";

export function selectBestImage(candidates: ImageSearchResult[], query?: string): ImageSearchResult | null {
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => scoreImage(b, query) - scoreImage(a, query))[0];
}

function scoreImage(candidate: ImageSearchResult, query?: string): number {
  const resolution = getResolutionScore(candidate.width, candidate.height);
  const cropFit = getCropFitScore(candidate.width, candidate.height);
  const source = getSourceScore(candidate.sourceUrl);
  const base = candidate.relevance ?? 0.5;
  const queryScore = getQueryScore(candidate, query);
  return base * 0.35 + queryScore * 0.25 + resolution * 0.18 + cropFit * 0.12 + source * 0.1;
}

function getResolutionScore(w?: number, h?: number) {
  if (!w || !h) return 0.5;
  const pixels = w * h;
  if (pixels >= 1080 * 1440) return 1;
  if (pixels >= 720 * 960) return 0.75;
  return 0.45;
}

function getCropFitScore(w?: number, h?: number) {
  if (!w || !h) return 0.55;
  const ratio = w / h;
  const target = 1080 / 1440;
  return Math.max(0, 1 - Math.abs(ratio - target));
}

function getSourceScore(url?: string) {
  if (!url) return 0.4;
  if (/official|oliveyoung|lotte|daiso|brand|instagram|visitseoul|naver/i.test(url)) return 0.85;
  if (/pinterest/i.test(url)) return 0.65;
  return 0.55;
}

function getQueryScore(candidate: ImageSearchResult, query?: string) {
  if (!query) return 0.5;
  const normalizedQuery = query.toLowerCase();
  const haystack = `${candidate.title ?? ""} ${candidate.sourceUrl ?? ""}`.toLowerCase();

  let score = 0.15;

  if (haystack && normalizedQuery.split(/\s+/).some((token) => token.length > 1 && haystack.includes(token))) {
    score += 0.5;
  }

  if (/(서울|ソウル|seoul)/i.test(normalizedQuery) && /(seoul|서울|ソウル)/i.test(haystack)) {
    score += 0.2;
  }

  if (/(韓国|한국|korea)/i.test(normalizedQuery) && /(korea|韓国|한국)/i.test(haystack)) {
    score += 0.15;
  }

  return Math.min(score, 1);
}
