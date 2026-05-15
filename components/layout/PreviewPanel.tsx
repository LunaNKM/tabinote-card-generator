"use client";

import { useGeneratorStore } from "@/store/generatorStore";
import { InstagramCard } from "@/components/cards/InstagramCard";
import { EditPanel } from "@/components/editor/EditPanel";

export function PreviewPanel() {
  const slides = useGeneratorStore((s) => s.slides);
  const activeSlideId = useGeneratorStore((s) => s.activeSlideId);
  const setActiveSlide = useGeneratorStore((s) => s.setActiveSlide);
  const error = useGeneratorStore((s) => s.errorMessage);

  return (
    <section className="flex h-[calc(100vh-56px)] flex-1 flex-col overflow-hidden bg-[var(--bg-page)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-panel)] px-7 py-4">
        <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">미리보기</div>
        {error && <div className="text-xs text-red-600">{error}</div>}
      </div>
      <div className="flex flex-1 gap-5 overflow-x-auto p-8">
        {slides.length ? slides.map((slide) => (
          <div key={slide.id} className="flex shrink-0 flex-col items-center gap-2">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">{String(slide.order).padStart(2, "0")} — {slide.type}</div>
            <InstagramCard
              slide={slide}
              domId={`preview-export-card-${slide.id}`}
              isActive={slide.id === activeSlideId}
              onClick={() => setActiveSlide(slide.id)}
            />
          </div>
        )) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
            왼쪽에서 제목을 입력하고 AI 생성 버튼을 눌러주세요.
          </div>
        )}
      </div>
      <EditPanel />
    </section>
  );
}
