import { NextResponse } from "next/server";
import { z } from "zod";
import type { Project } from "@/types/project";
import type { Slide, SlideType } from "@/types/slide";
import type { ImageSearchResult, SourcePreference } from "@/types/image";
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

type GenerateInput = z.infer<typeof RequestSchema>;

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
      const queryPlan = buildSlideImageQueries(input, ai.title, aiSlide.type, aiSlide.title, aiSlide.imageQuery ?? "", aiSlide.body ?? "");
      const preferredSource = normalizePreference(input.category, aiSlide.sourcePreference);
      const rawCandidates = await searchAcrossQueries({
        queries: queryPlan,
        sourcePreference: preferredSource,
        limit: aiSlide.imageMode === "collage-4" ? 28 : 18
      });

      const candidates = rawCandidates.filter((candidate) => !usedImageSignatures.has(makeImageSignature(candidate.imageUrl)));
      const pool = candidates.length ? candidates : rawCandidates;
      const selected = selectBestImage(pool, queryPlan[0]);
      const selectedSignature = makeImageSignature(selected?.imageUrl);
      if (selectedSignature) usedImageSignatures.add(selectedSignature);

      const imageUrls = aiSlide.imageMode === "collage-4"
        ? pickUniqueImageUrls(pool, usedImageSignatures, 4)
        : null;

      if (imageUrls?.length) {
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
        imageQuery: queryPlan[0],
        imageSourceUrl: selected?.sourceUrl ?? null,
        sourceLabel: selected?.sourceLabel ?? null,
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

function normalizePreference(category: GenerateInput["category"], preference?: SourcePreference): SourcePreference {
  if (category === "travel") return "any";
  return preference ?? "any";
}

async function searchAcrossQueries(params: {
  queries: string[];
  sourcePreference?: SourcePreference;
  limit: number;
}) {
  const merged: ImageSearchResult[] = [];
  const seen = new Set<string>();

  for (const query of params.queries) {
    if (!query.trim()) continue;
    const results = await searchImages({
      query,
      sourcePreference: params.sourcePreference,
      limit: params.limit
    });

    for (const item of results) {
      const signature = makeImageSignature(item.imageUrl);
      if (!signature || seen.has(signature)) continue;
      seen.add(signature);
      merged.push(item);
      if (merged.length >= params.limit) return merged;
    }
  }

  return merged;
}

function buildSlideImageQueries(
  input: GenerateInput,
  projectTitle: string,
  slideType: SlideType,
  slideTitle: string,
  aiQuery: string,
  slideBody: string
) {
  if (input.category === "travel") {
    return buildTravelQueries(projectTitle, slideType, slideTitle, aiQuery, slideBody);
  }

  const cleanTitle = cleanText(slideTitle);
  const cleanBody = cleanText(slideBody).split(" ").slice(0, 8).join(" ");
  const baseTopic = uniqueJoin([projectTitle, cleanTitle, aiQuery, cleanBody]);
  const categoryWords = getCategoryKeywords(input.category, slideType);

  return Array.from(new Set([
    uniqueJoin([baseTopic, categoryWords.primary]),
    uniqueJoin([cleanTitle, projectTitle, categoryWords.secondary]),
    uniqueJoin([cleanTitle, categoryWords.fallback])
  ].filter(Boolean)));
}

function buildTravelQueries(projectTitle: string, slideType: SlideType, slideTitle: string, aiQuery: string, slideBody: string) {
  const cleanTitle = cleanText(slideTitle);
  const placeHint = extractTravelPlace(cleanTitle, aiQuery, slideBody, projectTitle);

  if (slideType === "cover") {
    return Array.from(new Set([
      uniqueJoin([projectTitle, "ソウル 街歩き カフェ 通り 路地 写真"]),
      "ソウル 韓国 街歩き カフェ 通り 写真",
      "Seoul Korea neighborhood street cafe photo"
    ]));
  }

  if (slideType === "cta") {
    return Array.from(new Set([
      uniqueJoin(["ソウル 韓国 街歩き カフェ 通り 写真", placeHint]),
      "ソウル 韓国 街並み カフェ 路地 写真",
      "Seoul street cafe neighborhood photo"
    ]));
  }

  return Array.from(new Set([
    uniqueJoin([placeHint, "ソウル 韓国 街並み カフェ 通り 写真"]),
    uniqueJoin([placeHint, "Seoul neighborhood street cafe photo"]),
    uniqueJoin([cleanTitle, "ソウル 街歩き 写真"])
  ].filter(Boolean)));
}

function extractTravelPlace(cleanTitle: string, aiQuery: string, slideBody: string, projectTitle: string) {
  const combined = `${cleanTitle} ${aiQuery} ${slideBody} ${projectTitle}`;
  const candidates = [
    "聖水", "西村", "延南洞", "延南", "京義線森の道", "漢南洞", "漢南", "梨泰院", "汝矣島", "弘大", "安国", "北村", "益善洞", "江南", "狎鴎亭", "新沙", "明洞", "乙支路", "景福宮"
  ];

  const matched = candidates.filter((name) => combined.includes(name));
  if (matched.length) return matched.join(" ");

  return cleanTitle
    .replace(/王道だけど.*$/g, "")
    .replace(/大人っぽく.*$/g, "")
    .replace(/しっとり.*$/g, "")
    .replace(/トレンド感.*$/g, "")
    .trim();
}

function getCategoryKeywords(category: GenerateInput["category"], slideType: SlideType) {
  switch (category) {
    case "beauty":
      return {
        primary: slideType === "cover" ? "韓国 コスメ 売り場 商品 実写" : "韓国 コスメ 商品 パッケージ 実写",
        secondary: "K-beauty product store photo",
        fallback: "beauty product photo"
      };
    case "food":
      return {
        primary: "韓国 グルメ 料理 店舗 実写",
        secondary: "Korean food restaurant photo",
        fallback: "food photo"
      };
    case "fashion":
      return {
        primary: "韓国 ファッション ブランド 店舗 実写",
        secondary: "Korean fashion store street photo",
        fallback: "fashion photo"
      };
    case "lifestyle":
      return {
        primary: "韓国 ライフスタイル 雑貨 空間 実写",
        secondary: "Korean lifestyle interior photo",
        fallback: "lifestyle photo"
      };
    case "trend":
    default:
      return {
        primary: "韓国 トレンド 実写",
        secondary: "Korean trend photo",
        fallback: "trend photo"
      };
  }
}

function cleanText(value: string) {
  return value
    .replace(/[0-9０-９]+[.．、]?/g, " ")
    .replace(/[~〜]/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueJoin(parts: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of parts) {
    if (!part) continue;
    for (const token of part.split(/\s+/)) {
      const trimmed = token.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(trimmed);
    }
  }

  return result.join(" ");
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
