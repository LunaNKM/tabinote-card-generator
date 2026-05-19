"use client";

import type { ProjectCategory } from "@/types/project";

export function TopicForm({
  title,
  category,
  memo,
  onChange
}: {
  title: string;
  category: ProjectCategory;
  memo: string;
  onChange: (patch: Partial<{ title: string; category: ProjectCategory; memo: string }>) => void;
}) {
  return (
    <section className="border-b border-[var(--border)] px-7 py-6">
      <div className="mb-4 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">01 — 주제 입력</div>
      <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">카드뉴스 제목</label>
      <input className="app-input mb-4" value={title} onChange={(e) => onChange({ title: e.target.value })} />
      <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">카테고리</label>
      <select className="app-input mb-4" value={category} onChange={(e) => onChange({ category: e.target.value as ProjectCategory })}>
        <option value="beauty">뷰티 / コスメ</option>
        <option value="travel">여행 / 旅行</option>
        <option value="lifestyle">라이프 / ライフスタイル</option>
        <option value="food">푸드 / グルメ</option>
        <option value="fashion">패션 / ファッション</option>
        <option value="trend">트렌드 / トレンド</option>
      </select>
      <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">AI 메모</label>
      <textarea className="app-input min-h-[84px]" value={memo} onChange={(e) => onChange({ memo: e.target.value })} placeholder="강조하고 싶은 내용이 있으면 적어주세요" />
    </section>
  );
}
