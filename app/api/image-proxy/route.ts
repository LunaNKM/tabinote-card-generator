import { NextResponse } from "next/server";

const MAX_BYTES = 12 * 1024 * 1024;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");

  if (!target) {
    return new NextResponse("Missing url", { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    return new NextResponse("Unsupported protocol", { status: 400 });
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      cache: "no-store",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; tabinote-card-generator/1.0; +https://vercel.app)",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      }
    });

    if (!upstream.ok) {
      return new NextResponse("Image fetch failed", { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Target is not an image", { status: 415 });
    }

    const contentLength = Number(upstream.headers.get("content-length") || 0);
    if (contentLength && contentLength > MAX_BYTES) {
      return new NextResponse("Image too large", { status: 413 });
    }

    const buffer = await upstream.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) {
      return new NextResponse("Image too large", { status: 413 });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("image-proxy failed", error);
    return new NextResponse("Image proxy failed", { status: 500 });
  }
}
