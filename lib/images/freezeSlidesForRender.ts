import type { Slide } from "@/types/slide";

function toProxyUrl(src: string) {
  if (src.startsWith("data:")) return src;
  if (src.startsWith("blob:")) return src;
  if (src.startsWith("/api/image-proxy?url=")) return src;
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return `/api/image-proxy?url=${encodeURIComponent(src)}`;
  }
  return src;
}

async function blobToDataUrl(blob: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to convert blob to data URL"));
    };
    reader.onerror = () => reject(reader.error || new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}

export async function freezeImageForRender(src?: string | null) {
  if (!src) return null;
  if (src.startsWith("data:")) return src;

  const response = await fetch(toProxyUrl(src), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to freeze image: ${response.status}`);
  }

  const blob = await response.blob();
  return await blobToDataUrl(blob);
}

export async function freezeSlidesForRender(slides: Slide[]) {
  return await Promise.all(
    slides.map(async (slide) => {
      try {
        const resolvedImageUrl = slide.imageUrl ? await freezeImageForRender(slide.imageUrl) : null;
        const resolvedImageUrls = slide.imageUrls?.length
          ? (await Promise.all(slide.imageUrls.map((url) => freezeImageForRender(url)))).filter(
              (value): value is string => Boolean(value)
            )
          : null;

        return {
          ...slide,
          resolvedImageUrl,
          resolvedImageUrls
        };
      } catch (error) {
        console.error("[freezeSlidesForRender] failed", { slideId: slide.id, error });
        return slide;
      }
    })
  );
}
