"use client";

import { useState } from "react";
import type { ProjectCategory } from "@/types/project";
import { useGeneratorStore } from "@/store/generatorStore";
import { TopicForm } from "@/components/generator/TopicForm";
import { SlideList } from "@/components/generator/SlideList";
import { GenerateButton } from "@/components/generator/GenerateButton";
import { DownloadButton } from "@/components/generator/DownloadButton";

export function LeftPanel() {
  const [title, setTitle] = useState("韓国でバズってるダイソー神アイテムTOP5");
  const [category, setCategory] = useState<ProjectCategory>("beauty");
  const [memo, setMemo] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [includeCover, setIncludeCover] = useState(true);
  const [includeCta, setIncludeCta] = useState(true);

  const slides = useGeneratorStore((s) => s.slides);
  const activeSlideId = useGeneratorStore((s) => s.activeSlideId);
  const setActiveSlide = useGeneratorStore((s) => s.setActiveSlide);

  return (
    <aside className="sticky top-14 flex h-[calc(100vh-56px)] w-[420px] shrink-0 flex-col overflow-y-auto border-r border-[var(--border)] bg-[var(--bg-panel)]">
      <TopicForm title={title} category={category} memo={memo} onChange={(p) => {
        if (p.title !== undefined) setTitle(p.title);
        if (p.category !== undefined) setCategory(p.category);
        if (p.memo !== undefined) setMemo(p.memo);
      }} />

      <section className="border-b border-[var(--border)] px-7 py-6">
        <div className="mb-4 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">02 — 슬라이드 구성</div>
        <div className="mb-4 flex items-center gap-3">
          <button className="h-7 w-7 rounded-full border bg-white" onClick={() => setSlideCount(Math.max(1, slideCount - 1))}>−</button>
          <span className="font-mono text-lg font-bold text-[var(--accent)]">{slideCount}</span>
          <button className="h-7 w-7 rounded-full border bg-white" onClick={() => setSlideCount(Math.min(8, slideCount + 1))}>+</button>
          <span className="text-xs text-[var(--text-muted)]">장 / 총 {slideCount + Number(includeCover) + Number(includeCta)}장</span>
        </div>
        <label className="mb-2 flex items-center justify-between text-sm text-[var(--text-secondary)]">
          표지 포함
          <input type="checkbox" checked={includeCover} onChange={(e) => setIncludeCover(e.target.checked)} />
        </label>
        <label className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
          마지막 CTA 포함
          <input type="checkbox" checked={includeCta} onChange={(e) => setIncludeCta(e.target.checked)} />
        </label>
      </section>

      <SlideList slides={slides} activeSlideId={activeSlideId} onSelect={setActiveSlide} />

      <section className="px-7 py-6">
        <GenerateButton input={{ title, category, memo, slideCount, includeCover, includeCta }} />
        <DownloadButton />
      </section>
    </aside>
  );
}
