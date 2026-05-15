import { NextResponse } from "next/server";
import { searchImages, makeImageSignature } from "@/lib/images/searchImages";
import { selectBestImage } from "@/lib/images/selectBestImage";

export async function POST(req: Request) {
  const body = await req.json();
  const excludeUrls = new Set<string>((body.excludeUrls || []).map((url: string) => makeImageSignature(url)));
  const candidates = (await searchImages({
    query: body.query,
    sourcePreference: body.sourcePreference || "any",
    limit: body.limit || 12
  })).filter((candidate) => !excludeUrls.has(makeImageSignature(candidate.imageUrl)));

  return NextResponse.json({ candidates, selectedCandidate: selectBestImage(candidates) });
}
