import OpenAI from "openai";
import type { GenerateRequest } from "@/types/api";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import { validateAiOutput, type AiProject } from "./validateAiOutput";

export async function generateSlides(input: GenerateRequest): Promise<AiProject> {
  if (!process.env.OPENAI_API_KEY) return mockAiProject(input);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";

  const res = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(input) }
    ],
    response_format: { type: "json_object" }
  });

  const text = res.choices[0]?.message?.content;
  if (!text) throw new Error("AI response is empty");

  return validateAiOutput(JSON.parse(text));
}

function mockAiProject(input: GenerateRequest): AiProject {
  const slides = [] as AiProject["slides"];
  if (input.includeCover) {
    slides.push({
      type: "cover",
      title: input.title.replace(/TOP|N選/g, "\n$&"),
      hook: "＼韓国好きなら保存しておきたい／",
      imageMode: "collage-4",
      imageQuery: `${input.title} 한국 트렌드`,
      sourcePreference: "pinterest",
      layoutHint: "collage-cover"
    });
  }

  for (let i = 0; i < input.slideCount; i++) {
    slides.push({
      type: input.category === "travel" ? "place" : "item",
      title: ["まずチェックしたい", "話題のアイテム", "韓国っぽさ重視", "お土産にも◎", "保存推奨", "次の渡韓で"] [i] || `おすすめ ${i + 1}`,
      body: "韓国でじわじわ注目されているポイントを、\n日本の人にも分かりやすくまとめたカードです。\n気になる人は次の渡韓前にチェックしてみて。",
      imageMode: "single",
      imageQuery: `${input.title} 한국 ${i + 1}`,
      sourcePreference: "any",
      layoutHint: "body-heavy"
    });
  }

  if (input.includeCta) {
    slides.push({
      type: "cta",
      title: "気になる人は保存して",
      body: "次の渡韓で見返してね！",
      imageMode: "single",
      imageQuery: `${input.title} 한국`,
      sourcePreference: "pinterest",
      layoutHint: "large-title"
    });
  }

  return {
    title: input.title,
    category: input.category,
    concept: "mock generation",
    slides
  };
}
