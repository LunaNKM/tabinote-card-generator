import type { Slide } from "@/types/slide";
import { getMergedPreset } from "@/lib/layout/cardPresets";

export function CardBackground({ slide }: { slide: Slide }) {
  const settings = getMergedPreset(slide.type, slide.layoutSettings);
  const urls = slide.imageUrls?.length ? slide.imageUrls : slide.imageUrl ? [slide.imageUrl] : [];

  if (slide.imageMode === "collage-4" && urls.length >= 4) {
    return (
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
        {urls.slice(0, 4).map((url, i) => (
          <div key={i} className="bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />
        ))}
      </div>
    );
  }

  if (slide.imageMode === "collage-2" && urls.length >= 2) {
    return (
      <div className="absolute inset-0 grid grid-cols-2">
        {urls.slice(0, 2).map((url, i) => (
          <div key={i} className="bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 bg-cover"
      style={{
        backgroundImage: `url(${slide.imageUrl || "https://picsum.photos/seed/tabinote/1080/1440"})`,
        backgroundPosition: `${settings.imagePositionX}% ${settings.imagePositionY}%`
      }}
    />
  );
}
