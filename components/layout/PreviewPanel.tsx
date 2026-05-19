"use client";

import { useState } from "react";
import { useGeneratorStore } from "@/store/generatorStore";
import { InstagramCard } from "@/components/cards/InstagramCard";
import type { Slide } from "@/types/slide";

function ZoomModal({ slide, onClose }: { slide: Slide; onClose: () => void }) {
  const updateSlideLocal = useGeneratorStore((s) => s.updateSlideLocal);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-[900px] max-w-[95vw] overflow-y-auto rounded-2xl bg-[var(--bg-panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 확대 카드 */}
        <div className="flex shrink-0 items-start justify-center p-8">
          <div style={{ width: 405, height: 540, overflow: "hidden" }}>
            <div style={{ transform: "scale(1.5)", transformOrigin: "top left" }}>
              <InstagramCard slide={slide} />
            </div>
          </div>
        </div>

        {/* 편집 폼 */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-8 pl-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              {String(slide.order).padStart(2, "0")} — {slide.type} 편집
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[var(--text-secondary)]">상단 한 줄 (hook)</label>
            <input
              className="app-input"
              value={slide.hook || ""}
              onChange={(e) => updateSlideLocal(slide.id, { hook: e.target.value || null })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-secondary)]">제목 (엔터로 줄바꿈)</label>
            <textarea
              className="app-input min-h-[80px]"
              value={slide.title}
              onChange={(e) => updateSlideLocal(slide.id, { title: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-secondary)]">본문</label>
            <textarea
              className="app-input min-h-[100px]"
              value={slide.body || ""}
              onChange={(e) => updateSlideLocal(slide.id, { body: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-secondary)]">출처</label>
            <input
              className="app-input"
              value={slide.sourceLabel || ""}
              onChange={(e) => updateSlideLocal(slide.id, { sourceLabel: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-secondary)]">이미지 URL</label>
            <input
              className="app-input"
              value={slide.imageUrl || ""}
              onChange={(e) => updateSlideLocal(slide.id, { imageUrl: e.target.value })}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">제목 크기</label>
              <input
                className="app-input"
                type="number"
                value={slide.layoutSettings.titleSize || ""}
                onChange={(e) => updateSlideLocal(slide.id, { layoutSettings: { ...slide.layoutSettings, titleSize: Number(e.target.value) || undefined } })}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">본문 크기</label>
              <input
                className="app-input"
                type="number"
                value={slide.layoutSettings.bodySize || ""}
                onChange={(e) => updateSlideLocal(slide.id, { layoutSettings: { ...slide.layoutSettings, bodySize: Number(e.target.value) || undefined } })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PreviewPanel() {
  const slides = useGeneratorStore((s) => s.slides);
  const activeSlideId = useGeneratorStore((s) => s.activeSlideId);
  const setActiveSlide = useGeneratorStore((s) => s.setActiveSlide);
  const error = useGeneratorStore((s) => s.errorMessage);
  const [zoomedSlideId, setZoomedSlideId] = useState<string | null>(null);

  const zoomedSlide = slides.find((s) => s.id === zoomedSlideId) ?? null;

  function handleCardClick(slideId: string) {
    setActiveSlide(slideId);
    setZoomedSlideId(slideId);
  }

  return (
    <section className="flex h-[calc(100vh-56px)] flex-1 flex-col bg-[var(--bg-page)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-panel)] px-7 py-4">
        <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">미리보기</div>
        {error && <div className="text-xs text-red-600">{error}</div>}
      </div>
      <div className="flex flex-1 flex-wrap content-start gap-5 overflow-y-auto p-8">
        {slides.length ? slides.map((slide) => (
          <div key={slide.id} className="flex shrink-0 flex-col items-center gap-2">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">{String(slide.order).padStart(2, "0")} — {slide.type}</div>
            <InstagramCard
              slide={slide}
              domId={`preview-export-card-${slide.id}`}
              isActive={slide.id === activeSlideId}
              onClick={() => handleCardClick(slide.id)}
            />
          </div>
        )) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
            왼쪽에서 제목을 입력하고 AI 생성 버튼을 눌러주세요.
          </div>
        )}
      </div>
      {zoomedSlide && (
        <ZoomModal slide={zoomedSlide} onClose={() => setZoomedSlideId(null)} />
      )}
    </section>
  );
}
