export type SlideType = "cover" | "item" | "place" | "trend" | "cta";
export type ImageMode = "single" | "collage-2" | "collage-4";

export type SlideLayoutSettings = {
  titleSize?: number;
  bodySize?: number;
  titleWeight?: number;
  bodyWeight?: number;
  textLeft?: number;
  textBottom?: number;
  textMaxWidth?: number;
  lineHeightTitle?: number;
  lineHeightBody?: number;
  gradientStrength?: number;
  gradientStart?: number;
  imagePositionX?: number;
  imagePositionY?: number;
  logoOpacity?: number;
  sourceOpacity?: number;
};

export type Slide = {
  id: string;
  projectId: string;
  order: number;
  type: SlideType;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  hook?: string | null;
  bullets?: string[] | null;
  imageMode: ImageMode;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  imageQuery?: string | null;
  imageSourceUrl?: string | null;
  sourceLabel?: string | null;
  layoutSettings: SlideLayoutSettings;
  createdAt: string;
  updatedAt: string;
};
