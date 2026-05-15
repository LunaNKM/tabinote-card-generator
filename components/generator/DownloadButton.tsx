"use client";

import { toBlob } from "html-to-image";
import { saveAs } from "file-saver";
import { useGeneratorStore } from "@/store/generatorStore";
import { createZipFromBlobs } from "@/lib/export/createZip";
import { getSlideFileName, getZipFileName } from "@/lib/export/fileNames";

export function DownloadButton() {
  const slides = useGeneratorStore((s) => s.slides);
  const project = useGeneratorStore((s) => s.project);

  async function downloadZip() {
    const files = [];
    for (let i = 0; i < slides.length; i++) {
      const node = document.getElementById(`export-card-${slides[i].id}`);
      if (!node) continue;
      const blob = await toBlob(node, { cacheBust: true, pixelRatio: 1 });
      if (blob) files.push({ fileName: getSlideFileName(slides[i], i), blob });
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
