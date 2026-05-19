"use client";

import { useGeneratorStore } from "@/store/generatorStore";

export function EditPanel() {
  const slides = useGeneratorStore((s) => s.slides);
  const activeSlideId = useGeneratorStore((s) => s.activeSlideId);
  const updateSlideLocal = useGeneratorStore((s) => s.updateSlideLocal);
  const slide = slides.find((s) => s.id === activeSlideId);

  if (!slide) {
    return <div className="border-t border-[var(--border)] bg-[var(--bg-panel)] p-7 text-sm text-[var(--text-muted)]">슬라이드를 생성하거나 선택해 주세요.</div>;
  }

  return (
    <div className="border-t border-[var(--border)] bg-[var(--bg-panel)] p-7">
      <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
        {String(slide.order).padStart(2, "0")} — {slide.type} 편집 중
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="mb-1 block text-xs text-[var(--text-secondary)]">상단 한 줄 (hook)</label>
          <input className="app-input" value={slide.hook || ""} onChange={(e) => updateSlideLocal(slide.id, { hook: e.target.value || null })} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--text-secondary)]">제목 (엔터로 줄바꿈)</label>
          <textarea className="app-input min-h-[72px]" value={slide.title} onChange={(e) => updateSlideLocal(slide.id, { title: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--text-secondary)]">출처</label>
          <input className="app-input" value={slide.sourceLabel || ""} onChange={(e) => updateSlideLocal(slide.id, { sourceLabel: e.target.value })} />
        </div>
        <div className="col-span-2">
          <label className="mb-1 block text-xs text-[var(--text-secondary)]">본문</label>
          <textarea className="app-input min-h-[90px]" value={slide.body || ""} onChange={(e) => updateSlideLocal(slide.id, { body: e.target.value })} />
        </div>
        <div className="col-span-2">
          <label className="mb-1 block text-xs text-[var(--text-secondary)]">이미지 URL</label>
          <input className="app-input" value={slide.imageUrl || ""} onChange={(e) => updateSlideLocal(slide.id, { imageUrl: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--text-secondary)]">제목 크기</label>
          <input className="app-input" type="number" value={slide.layoutSettings.titleSize || ""} onChange={(e) => updateSlideLocal(slide.id, { layoutSettings: { ...slide.layoutSettings, titleSize: Number(e.target.value) || undefined } })} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--text-secondary)]">본문 크기</label>
          <input className="app-input" type="number" value={slide.layoutSettings.bodySize || ""} onChange={(e) => updateSlideLocal(slide.id, { layoutSettings: { ...slide.layoutSettings, bodySize: Number(e.target.value) || undefined } })} />
        </div>
      </div>
    </div>
  );
}
