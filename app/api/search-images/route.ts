import { NextResponse } from "next/server";
import { searchImages } from "@/lib/images/searchImages";
import { selectBestImage } from "@/lib/images/selectBestImage";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.query || typeof body.query !== "string") {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 }
      );
    }

    const candidates = await searchImages({
      query: body.query,
      sourcePreference: body.sourcePreference || "any",
      limit: body.limit || 8
    });

    return NextResponse.json({
      candidates,
      selectedCandidate: selectBestImage(candidates)
    });
  } catch (error) {
    console.error("/api/search-images failed", error);
    return NextResponse.json(
      { error: "Image search failed" },
      { status: 500 }
    );
  }
}
