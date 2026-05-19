"use client";

import type { GenerateRequest } from "@/types/api";
import { useGeneratorStore } from "@/store/generatorStore";

export function GenerateButton({ input }: { input: GenerateRequest }) {
  const generateProject = useGeneratorStore((s) => s.generateProject);
  const isGenerating = useGeneratorStore((s) => s.isGenerating);

  return (
    <button
      onClick={() => generateProject(input)}
      disabled={isGenerating || !input.title.trim()}
      className="w-full rounded-[7px] bg-[var(--accent)] px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#6b5340] disabled:opacity-50"
    >
      {isGenerating ? "생성 중..." : "▸ AI 문안 + 이미지 자동 생성"}
    </button>
  );
}
