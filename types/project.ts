import type { Slide } from "./slide";

export type ProjectStatus = "draft" | "generating" | "generated" | "exported" | "error";
export type ProjectCategory = "beauty" | "travel" | "lifestyle" | "food" | "fashion" | "trend";

export type Project = {
  id: string;
  title: string;
  category: ProjectCategory;
  memo?: string | null;
  status: ProjectStatus;
  slideCount: number;
  includeCover: boolean;
  includeCta: boolean;
  aiModel?: string | null;
  aiInput?: unknown;
  aiOutput?: unknown;
  createdAt: string;
  updatedAt: string;
  slides?: Slide[];
};
