import { z } from "zod";

export const AiSlideSchema = z.object({
  type: z.enum(["cover", "item", "place", "trend", "cta"]),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  hook: z.string().optional(),
  body: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  imageMode: z.enum(["single", "collage-2", "collage-4"]).default("single"),
  imageQuery: z.string().min(1),
  sourcePreference: z.enum(["official", "retail", "pinterest", "any"]).default("any"),
  layoutHint: z.string().optional()
});

export const AiProjectSchema = z.object({
  title: z.string().min(1),
  category: z.enum(["beauty", "travel", "lifestyle", "food", "fashion", "trend"]),
  concept: z.string().optional(),
  slides: z.array(AiSlideSchema).min(1)
});

export type AiProject = z.infer<typeof AiProjectSchema>;

export function validateAiOutput(value: unknown): AiProject {
  return AiProjectSchema.parse(value);
}
