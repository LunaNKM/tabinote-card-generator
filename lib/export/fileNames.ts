import type { Slide } from "@/types/slide";

export function getSlideFileName(slide: Slide, index: number) {
  return `${String(index + 1).padStart(2, "0")}_${slide.type}.png`;
}

export function getZipFileName(title: string) {
  const safe = title.replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 50);
  return `tabinote_${safe}.zip`;
}
