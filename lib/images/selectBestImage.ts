import type { ImageSearchResult } from "@/types/image";

export function selectBestImage(candidates: ImageSearchResult[]): ImageSearchResult | null {
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => scoreImage(b) - scoreImage(a))[0];
}

function scoreImage(candidate: ImageSearchResult): number {
  const resolution = getResolutionScore(candidate.width, candidate.height);
  const cropFit = getCropFitScore(candidate.width, candidate.height);
  const source = getSourceScore(candidate.sourceUrl);
  return (candidate.relevance ?? 0.5) * 0.35 + resolution * 0.2 + cropFit * 0.25 + source * 0.2;
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
  if (/official|oliveyoung|lotte|daiso|brand|instagram/i.test(url)) return 0.85;
  if (/pinterest/i.test(url)) return 0.65;
  return 0.55;
}
