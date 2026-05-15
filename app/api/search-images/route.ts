import { NextResponse } from "next/server";
import { searchImages } from "@/lib/images/searchImages";
import { selectBestImage } from "@/lib/images/selectBestImage";

export async function POST(req: Request) {
  const body = await req.json();
  const candidates = await searchImages({
    query: body.query,
    sourcePreference: body.sourcePreference || "any",
    limit: body.limit || 8
  });
  return NextResponse.json({ candidates, selectedCandidate: selectBestImage(candidates) });
}
