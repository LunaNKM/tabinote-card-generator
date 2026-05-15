"use client";

import { useState } from "react";
import { createRoot } from "react-dom/client";
import { toBlob } from "html-to-image";
import { saveAs } from "file-saver";
import { useGeneratorStore } from "@/store/generatorStore";
import { createZipFromBlobs } from "@/lib/export/createZip";
import { getSlideFileName, getZipFileName } from "@/lib/export/fileNames";
import { InstagramCard } from "@/components/cards/InstagramCard";
import type { Slide } from "@/types/slide";

const EXPORT_WIDTH = 1080;
const EXPORT_HEIGHT = 1440;
const IMAGE_WAIT_TIMEOUT_MS = 8000;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForFonts() {
  if (typeof document !== "undefined" && "fonts" in document) {
    await (document as Document & { fonts: FontFaceSet }).fonts.ready;
  }
}

async function waitForImage(img: HTMLImageElement) {
  if (img.complete && img.naturalWidth > 0) return;

  await Promise.race([
    new Promise<void>((resolve) => {
      const done = () => resolve();
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }),
    sleep(IMAGE_WAIT_TIMEOUT_MS)
  ]);

  if (img.complete && img.naturalWidth > 0 && typeof img.decode === "function") {
    try {
      await Promise.race([img.decode(), sleep(1500)]);
    } catch {
      // html-to-image can still export the already-loaded image.
    }
  }
}

async function waitForImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(images.map(waitForImage));
}

async function renderSlideToExportNode(slide: Slide) {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.width = `${EXPORT_WIDTH}px`;
  host.style.height = `${EXPORT_HEIGHT}px`;
  host.style.pointerEvents = "none";
  host.style.opacity = "1";
  host.style.zIndex = "-1";
  host.style.background = "#000";
  document.body.appendChild(host);

  const root = createRoot(host);
  root.render(<InstagramCard slide={slide} renderMode="export" domId={`zip-export-card-${slide.id}`} />);

  await nextFrame();
  await nextFrame();

  const node = document.getElementById(`zip-export-card-${slide.id}`) as HTMLElement | null;
  if (!node) {
    root.unmount();
    host.remove();
    throw new Error(`Export node not found: ${slide.id}`);
  }

  await waitForFonts();
  await waitForImages(node);
  await nextFrame();

  return { host, root, node };
}

async function exportSlide(slide: Slide) {
  const { host, root, node } = await renderSlideToExportNode(slide);

  try {
    const blob = await toBlob(node, {
      cacheBust: false,
      pixelRatio: 1,
      backgroundColor: "#000000",
      width: EXPORT_WIDTH,
      height: EXPORT_HEIGHT,
      canvasWidth: EXPORT_WIDTH,
      canvasHeight: EXPORT_HEIGHT,
      style: {
        width: `${EXPORT_WIDTH}px`,
        height: `${EXPORT_HEIGHT}px`,
        margin: "0",
        transform: "none"
      }
    });

    if (!blob) {
      throw new Error(`PNG 생성 실패: ${slide.title}`);
    }

    return blob;
  } finally {
    root.unmount();
    host.remove();
  }
}

export function DownloadButton() {
  const slides = useGeneratorStore((s) => s.slides);
  const project = useGeneratorStore((s) => s.project);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function downloadZip() {
    if (!slides.length || isDownloading) return;

    setIsDownloading(true);
    setErrorMessage(null);

    try {
      const files: Array<{ fileName: string; blob: Blob }> = [];

      for (let i = 0; i < slides.length; i++) {
        const blob = await exportSlide(slides[i]);
        files.push({ fileName: getSlideFileName(slides[i], i), blob });
      }

      if (!files.length) {
        throw new Error("다운로드할 PNG가 생성되지 않았습니다.");
      }

      const zip = await createZipFromBlobs(files);
      saveAs(zip, getZipFileName(project?.title || "tabinote"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "ZIP 다운로드에 실패했습니다.";
      console.error("[DownloadButton] export failed", error);
      setErrorMessage(message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="mt-2 space-y-2">
      <button
        type="button"
        onClick={downloadZip}
        disabled={!slides.length || isDownloading}
        className="w-full rounded-[7px] border border-[var(--border-mid)] bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] transition hover:bg-[#ede9e3] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDownloading ? "PNG 생성 중..." : `↓ ZIP 다운로드 (PNG × ${slides.length})`}
      </button>
      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
