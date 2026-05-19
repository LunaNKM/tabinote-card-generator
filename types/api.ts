import type { Project, ProjectCategory } from "./project";
import type { Slide } from "./slide";

export type GenerateRequest = {
  title: string;
  category: ProjectCategory;
  slideCount: number;
  includeCover: boolean;
  includeCta: boolean;
  memo?: string;
};

export type GenerateResponse = {
  project: Project;
  slides: Slide[];
};
