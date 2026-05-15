import type { Slide } from "@/types/slide";
import { getMergedPreset } from "@/lib/layout/cardPresets";

function toSafeImageSrc(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("/") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

function EmptyBackground() {
  return <div className="absolute inset-0 bg-[#111111]" />;
}

function BackgroundImage({ url, positionX = 50, positionY = 50 }: { url?: string | null; positionX?: number; positionY?: number }) {
  const safeSrc = toSafeImageSrc(url);
  if (!safeSrc) return <EmptyBackground />;

  return (
    <img
      src={safeSrc}
      alt=""
      className="h-full w-full object-cover"
      style={{ objectPosition: `${positionX}% ${positionY}%` }}
      draggable={false}
      crossOrigin="anonymous"
    />
  );
}

export function CardBackground({ slide }: { slide: Slide }) {
  const settings = getMergedPreset(slide.type, slide.layoutSettings);
  const urls = slide.imageUrls?.length ? slide.imageUrls.filter(Boolean) : slide.imageUrl ? [slide.imageUrl] : [];

  if (slide.imageMode === "collage-4" && urls.length >= 4) {
    return (
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
        {urls.slice(0, 4).map((url, i) => (
          <BackgroundImage key={`${url}-${i}`} url={url} positionX={settings.imagePositionX} positionY={settings.imagePositionY} />
        ))}
      </div>
    );
  }

  if (slide.imageMode === "collage-2" && urls.length >= 2) {
    return (
      <div className="absolute inset-0 grid grid-cols-2">
        {urls.slice(0, 2).map((url, i) => (
          <BackgroundImage key={`${url}-${i}`} url={url} positionX={settings.imagePositionX} positionY={settings.imagePositionY} />
        ))}
      </div>
    );
  }

  if (!slide.imageUrl) {
    return <EmptyBackground />;
  }

  return (
    <div className="absolute inset-0">
      <BackgroundImage url={slide.imageUrl} positionX={settings.imagePositionX} positionY={settings.imagePositionY} />
    </div>
  );
}
