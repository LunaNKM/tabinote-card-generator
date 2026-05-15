import { NextResponse } from "next/server";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return new NextResponse("Missing url", { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  if (!ALLOWED_PROTOCOLS.has(target.protocol)) {
    return new NextResponse("Unsupported protocol", { status: 400 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      cache: "no-store",
      headers: {
        "user-agent": "Mozilla/5.0 TabinoteImageProxy/1.0",
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        referer: target.origin
      }
    });

    if (!upstream.ok) {
      return new NextResponse(`Upstream fetch failed: ${upstream.status}`, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Upstream did not return an image", { status: 415 });
    }

    const data = await upstream.arrayBuffer();

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store, max-age=0",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("[image-proxy] failed", error);
    return new NextResponse("Image proxy failed", { status: 500 });
  }
}
