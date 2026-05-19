"use client";

import { useGeneratorStore } from "@/store/generatorStore";

export function AppHeader() {
  const isGenerating = useGeneratorStore((s) => s.isGenerating);
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[#faf9f7]/90 px-8 backdrop-blur-md">
      <div className="text-[15px] font-semibold tracking-wide text-[var(--accent)]">
        tabinote <span className="font-normal text-[var(--text-muted)]">/ card generator</span>
      </div>
      <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
        <span>{isGenerating ? "generating" : "internal tool v0.1"}</span>
        <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,.8)]" />
      </div>
    </header>
  );
}
