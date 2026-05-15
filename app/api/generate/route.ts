import { NextResponse } from "next/server";
import { z } from "zod";
import type { Project } from "@/types/project";
import type { Slide } from "@/types/slide";
import type { ImageSearchResult } from "@/types/image";
import { generateSlides } from "@/lib/ai/generateSlides";
import { searchImages, makeImageSignature } from "@/lib/images/searchImages";
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
    const usedImageSignatures = new Set<string>();

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
      const slideId = crypto.randomUUID();
      const query = buildSlideImageQuery(input.title, aiSlide.title, aiSlide.imageQuery, i, aiSlide.type);
      const rawCandidates = await searchImages({
        query,
        sourcePreference: aiSlide.sourcePreference,
        limit: aiSlide.imageMode === "collage-4" ? 16 : 12
      });

      const candidates = rawCandidates.filter((candidate) => !usedImageSignatures.has(makeImageSignature(candidate.imageUrl)));
      const pool = candidates.length ? candidates : rawCandidates;
      const selected = selectBestImage(pool);
      const selectedSignature = makeImageSignature(selected?.imageUrl);
      if (selectedSignature) usedImageSignatures.add(selectedSignature);

      const imageUrls = aiSlide.imageMode === "collage-4"
        ? pickUniqueImageUrls(pool, usedImageSignatures, 4)
        : null;

      if (imageUrls) {
        imageUrls.forEach((url) => usedImageSignatures.add(makeImageSignature(url)));
      }

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
        imageUrls,
        imageQuery: query,
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

function buildSlideImageQuery(projectTitle: string, slideTitle: string, aiQuery: string, index: number, type: string) {
  const cleanSlideTitle = slideTitle.replace(/[0-9０-９]+[.．、]?/g, "").replace(/\n/g, " ").trim();

  if (type === "cover") {
    return `${projectTitle} 韓国 ダイソー 人気 アイテム 店内 コスメ 売り場`;
  }

  if (type === "cta") {
    return `${projectTitle} 韓国 ダイソー 店舗 外観`;
  }

  return `${aiQuery} ${cleanSlideTitle} 韓国 ダイソー 商品 画像 ${index + 1}`;
}

function pickUniqueImageUrls(candidates: ImageSearchResult[], used: Set<string>, count: number) {
  const urls: string[] = [];
  const localSeen = new Set<string>();

  for (const candidate of candidates) {
    const signature = makeImageSignature(candidate.imageUrl);
    if (!signature || used.has(signature) || localSeen.has(signature)) continue;
    localSeen.add(signature);
    urls.push(candidate.imageUrl);
    if (urls.length >= count) break;
  }

  if (urls.length < count) {
    for (const candidate of candidates) {
      const signature = makeImageSignature(candidate.imageUrl);
      if (!signature || localSeen.has(signature)) continue;
      localSeen.add(signature);
      urls.push(candidate.imageUrl);
      if (urls.length >= count) break;
    }
  }

  return urls.length ? urls : null;
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
