"use client";

import type { Slide } from "@/types/slide";
import { cn } from "@/lib/utils/cn";

export function SlideList({ slides, activeSlideId, onSelect }: { slides: Slide[]; activeSlideId: string | null; onSelect: (id: string) => void }) {
  return (
    <section className="flex-1 border-b border-[var(--border)] px-7 py-6">
      <div className="mb-4 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">03 — 슬라이드 목록</div>
      <div className="flex flex-col gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => onSelect(slide.id)}
            className={cn(
              "rounded-[7px] border p-3 text-left transition",
              activeSlideId === slide.id ? "border-[#6b5340] bg-[#ede5d8]" : "border-[var(--border)] bg-white hover:bg-[#ede9e3]"
            )}
          >
            <div className="mb-1 flex gap-2 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span>{slide.type}</span>
            </div>
            <div className="truncate text-xs font-medium text-[var(--text-secondary)]">{slide.title.replace(/\n/g, " ")}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
