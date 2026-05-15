"use client";

import { toBlob } from "html-to-image";
import { saveAs } from "file-saver";
import { useGeneratorStore } from "@/store/generatorStore";
import { createZipFromBlobs } from "@/lib/export/createZip";
import { getSlideFileName, getZipFileName } from "@/lib/export/fileNames";

async function waitForImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => resolve();
        img.onload = done;
        img.onerror = done;
        setTimeout(done, 5000);
      });
    })
  );
}

export function DownloadButton() {
  const slides = useGeneratorStore((s) => s.slides);
  const project = useGeneratorStore((s) => s.project);
  const isExporting = useGeneratorStore((s) => s.isExporting);
  const setExporting = useGeneratorStore((s) => s.setExporting);

  async function downloadZip() {
    if (!slides.length || isExporting) return;
    setExporting(true);
    try {
      const files = [];
      for (let i = 0; i < slides.length; i++) {
        const node = document.getElementById(`card-frame-${slides[i].id}`) as HTMLElement | null;
        if (!node) continue;
        await waitForImages(node);
        const blob = await toBlob(node, {
          cacheBust: true,
          pixelRatio: 1,
          width: 1080,
          height: 1440,
          style: { width: "1080px", height: "1440px", transform: "none" }
        });
        if (blob) files.push({ fileName: getSlideFileName(slides[i], i), blob });
      }
      const zip = await createZipFromBlobs(files);
      saveAs(zip, getZipFileName(project?.title || "tabinote"));
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      onClick={downloadZip}
      disabled={!slides.length || isExporting}
      className="mt-2 w-full rounded-[7px] border border-[var(--border-mid)] bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] transition hover:bg-[#ede9e3] disabled:opacity-50"
    >
      {isExporting ? "PNG 생성 중..." : `↓ ZIP 다운로드 (PNG × ${slides.length})`}
    </button>
  );
}
