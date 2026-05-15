"use client";

import { toBlob } from "html-to-image";
import { saveAs } from "file-saver";
import { useGeneratorStore } from "@/store/generatorStore";
import { createZipFromBlobs } from "@/lib/export/createZip";
import { getSlideFileName, getZipFileName } from "@/lib/export/fileNames";

async function waitForImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map(async (img) => {
      if (img.complete && img.naturalWidth > 0) return;
      try {
        if (typeof img.decode === "function") {
          await img.decode();
        } else {
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Image failed to load"));
          });
        }
      } catch {
        // ignore per-image decode errors and let toBlob attempt export
      }
    })
  );
}

async function waitForFonts() {
  if (typeof document !== "undefined" && "fonts" in document) {
    await (document as Document & { fonts: FontFaceSet }).fonts.ready;
  }
}

export function DownloadButton() {
  const slides = useGeneratorStore((s) => s.slides);
  const project = useGeneratorStore((s) => s.project);

  async function downloadZip() {
    const files: Array<{ fileName: string; blob: Blob }> = [];

    await waitForFonts();

    for (let i = 0; i < slides.length; i++) {
      const node = document.getElementById(`preview-export-card-${slides[i].id}`) as HTMLElement | null;
      if (!node) continue;

      await waitForImages(node);

      const blob = await toBlob(node, {
        cacheBust: false,
        pixelRatio: 4,
        backgroundColor: "#000000",
        canvasWidth: 1080,
        canvasHeight: 1440,
        style: {
          margin: "0"
        }
      });

      if (blob) {
        files.push({ fileName: getSlideFileName(slides[i], i), blob });
      }
    }

    const zip = await createZipFromBlobs(files);
    saveAs(zip, getZipFileName(project?.title || "tabinote"));
  }

  return (
    <button
      onClick={downloadZip}
      disabled={!slides.length}
      className="mt-2 w-full rounded-[7px] border border-[var(--border-mid)] bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] transition hover:bg-[#ede9e3] disabled:opacity-50"
    >
      ↓ ZIP 다운로드 (PNG × {slides.length})
    </button>
  );
}
