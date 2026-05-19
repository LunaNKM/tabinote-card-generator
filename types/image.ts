export type SourcePreference = "official" | "retail" | "pinterest" | "any";

export type ImageCandidate = {
  id: string;
  slideId: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  sourceUrl?: string | null;
  sourceLabel?: string | null;
  width?: number | null;
  height?: number | null;
  score?: number | null;
  isSelected: boolean;
  createdAt: string;
};

export type ImageSearchResult = {
  imageUrl: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  sourceLabel?: string;
  width?: number;
  height?: number;
  relevance?: number;
  title?: string;
};
