"use client";

import { create } from "zustand";
import type { GenerateRequest } from "@/types/api";
import type { Project } from "@/types/project";
import type { Slide, SlideType } from "@/types/slide";
import { freezeSlidesForRender } from "@/lib/images/freezeSlidesForRender";

export type GeneratorState = {
  project: Project | null;
  slides: Slide[];
  activeSlideId: string | null;
  isGenerating: boolean;
  isExporting: boolean;
  errorMessage: string | null;
  setActiveSlide: (slideId: string) => void;
  updateSlideLocal: (slideId: string, patch: Partial<Slide>) => void;
  generateProject: (input: GenerateRequest) => Promise<void>;
  addSlide: (type: SlideType) => void;
  removeSlide: (slideId: string) => void;
  setSlides: (slides: Slide[]) => void;
};

export const useGeneratorStore = create<GeneratorState>((set, get) => ({
  project: null,
  slides: [],
  activeSlideId: null,
  isGenerating: false,
  isExporting: false,
  errorMessage: null,

  setActiveSlide: (slideId) => set({ activeSlideId: slideId }),

  setSlides: (slides) => set({ slides, activeSlideId: slides[0]?.id ?? null }),

  updateSlideLocal: (slideId, patch) => {
    set({ slides: get().slides.map((s) => (s.id === slideId ? { ...s, ...patch } : s)) });
  },

  generateProject: async (input) => {
    set({ isGenerating: true, errorMessage: null });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const frozenSlides = await freezeSlidesForRender(data.slides);
      set({ project: data.project, slides: frozenSlides, activeSlideId: frozenSlides[0]?.id ?? null });
    } catch (e) {
      set({ errorMessage: e instanceof Error ? e.message : "Generation failed" });
    } finally {
      set({ isGenerating: false });
    }
  },

  addSlide: (type) => {
    const projectId = get().project?.id ?? "local";
    const now = new Date().toISOString();
    const slide: Slide = {
      id: crypto.randomUUID(),
      projectId,
      order: get().slides.length + 1,
      type,
      title: type === "cta" ? "気になる人は保存して" : "新しいカード",
      body: type === "cta" ? "次の渡韓で見返してね！" : "本文を入力してください。",
      imageMode: "single",
      imageUrl: null,
      resolvedImageUrl: null,
      sourceLabel: null,
      layoutSettings: {},
      createdAt: now,
      updatedAt: now
    };
    set({ slides: [...get().slides, slide], activeSlideId: slide.id });
  },

  removeSlide: (slideId) => {
    const slides = get().slides.filter((s) => s.id !== slideId).map((s, i) => ({ ...s, order: i + 1 }));
    set({ slides, activeSlideId: slides[0]?.id ?? null });
  }
}));
