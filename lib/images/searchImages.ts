import type { ImageSearchResult, SourcePreference } from "@/types/image";
import { normalizeSource } from "./normalizeSource";

export async function searchImages(params: {
  query: string;
  sourcePreference?: SourcePreference;
  limit?: number;
}): Promise<ImageSearchResult[]> {
  const limit = params.limit ?? 8;
  const key = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!key || !cx) {
    return mockImageResults(params.query, limit);
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", key);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", buildQuery(params.query, params.sourcePreference));
  url.searchParams.set("searchType", "image");
  url.searchParams.set("num", String(Math.min(limit, 10)));
  url.searchParams.set("safe", "active");

  const res = await fetch(url);
  if (!res.ok) throw new Error("Image search failed");

  const data = await res.json();
  return (data.items ?? []).map((item: any) => ({
    imageUrl: item.link,
    thumbnailUrl: item.image?.thumbnailLink,
    sourceUrl: item.image?.contextLink,
    sourceLabel: normalizeSource(item.image?.contextLink),
    width: item.image?.width,
    height: item.image?.height,
    relevance: 0.75
  }));
}

function buildQuery(query: string, preference?: SourcePreference) {
  if (preference === "official") return `${query} 공식 official`;
  if (preference === "retail") return `${query} 올리브영 롯데 다이소 쇼핑몰`;
  if (preference === "pinterest") return `${query} site:pinterest.com`;
  return query;
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
