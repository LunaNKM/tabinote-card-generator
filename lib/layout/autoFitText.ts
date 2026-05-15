import type { Slide, SlideLayoutSettings } from "@/types/slide";

export function autoFitText(slide: Slide): SlideLayoutSettings {
  const text = [slide.title, slide.body, slide.hook, ...(slide.bullets ?? [])].filter(Boolean).join("");
  const length = text.length;

  if (length > 210) return { titleSize: 48, bodySize: 28, lineHeightBody: 1.42 };
  if (length > 165) return { titleSize: 52, bodySize: 30, lineHeightBody: 1.45 };
  if (length > 120) return { titleSize: 56, bodySize: 32, lineHeightBody: 1.50 };
  return {};
}
