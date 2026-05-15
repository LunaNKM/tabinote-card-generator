import { NextResponse } from "next/server";
import { z } from "zod";
import type { Project } from "@/types/project";
import type { Slide } from "@/types/slide";
import { generateSlides } from "@/lib/ai/generateSlides";
import { searchImages } from "@/lib/images/searchImages";
import { selectBestImage } from "@/lib/images/selectBestImage";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const RequestSchema = z.object({
  title: z.string().min(1),
  category: z.enum(["beauty", "travel", "lifestyle", "food", "fashion", "trend"]),
  slideCount: z.number().int().min(1).max(8),
  includeCover: z.boolean(),
  includeCta: z.boolean(),
  memo: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const input = RequestSchema.parse(await req.json());
    const ai = await generateSlides(input);
    const now = new Date().toISOString();
    const projectId = crypto.randomUUID();

    const project: Project = {
      id: projectId,
      title: ai.title,
      category: ai.category,
      memo: input.memo ?? null,
      status: "generated",
      slideCount: input.slideCount,
      includeCover: input.includeCover,
      includeCta: input.includeCta,
      aiModel: process.env.OPENAI_MODEL || "mock",
      aiInput: input,
      aiOutput: ai,
      createdAt: now,
      updatedAt: now
    };

    const slides: Slide[] = [];
    for (let i = 0; i < ai.slides.length; i++) {
      const aiSlide = ai.slides[i];
      const candidates = await searchImages({
        query: aiSlide.imageQuery,
        sourcePreference: aiSlide.sourcePreference,
        limit: aiSlide.imageMode === "collage-4" ? 4 : 8
      });
      const selected = selectBestImage(candidates);
      const slideId = crypto.randomUUID();
      slides.push({
        id: slideId,
        projectId,
        order: i + 1,
        type: aiSlide.type,
        title: aiSlide.title,
        subtitle: aiSlide.subtitle ?? null,
        hook: aiSlide.hook ?? null,
        body: aiSlide.body ?? null,
        bullets: aiSlide.bullets ?? null,
        imageMode: aiSlide.imageMode,
        imageUrl: selected?.imageUrl ?? null,
        imageUrls: aiSlide.imageMode === "collage-4" ? candidates.slice(0, 4).map((c) => c.imageUrl) : null,
        imageQuery: aiSlide.imageQuery,
        imageSourceUrl: selected?.sourceUrl ?? null,
        sourceLabel: selected?.sourceLabel ?? "Photo | Pinterest",
        layoutSettings: {},
        createdAt: now,
        updatedAt: now
      });
    }

    await tryPersist(project, slides);

    return NextResponse.json({ project, slides });
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : "Generate failed", { status: 500 });
  }
}

async function tryPersist(project: Project, slides: Slide[]) {
  const supabase = createServerSupabaseClient();
  if (!supabase) return;

  await supabase.from("projects").insert({
    id: project.id,
    title: project.title,
    category: project.category,
    memo: project.memo,
    status: project.status,
    slide_count: project.slideCount,
    include_cover: project.includeCover,
    include_cta: project.includeCta,
    ai_model: project.aiModel,
    ai_input: project.aiInput,
    ai_output: project.aiOutput
  });

  await supabase.from("slides").insert(slides.map((s) => ({
    id: s.id,
    project_id: s.projectId,
    slide_order: s.order,
    slide_type: s.type,
    title: s.title,
    subtitle: s.subtitle,
    body: s.body,
    hook: s.hook,
    bullets: s.bullets,
    image_mode: s.imageMode,
    image_url: s.imageUrl,
    image_urls: s.imageUrls,
    image_query: s.imageQuery,
    image_source_url: s.imageSourceUrl,
    source_label: s.sourceLabel,
    layout_settings: s.layoutSettings
  })));
}
