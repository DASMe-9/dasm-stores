import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set(["media.taager.com"]);
const CACHE_CONTROL = "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";

export const runtime = "nodejs";
export const revalidate = 86400;

function parseAllowedImageUrl(raw: string | null) {
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function inferImageContentType(pathname: string) {
  const path = pathname.toLowerCase();
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".gif")) return "image/gif";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  return null;
}

export async function GET(request: NextRequest) {
  const source = parseAllowedImageUrl(request.nextUrl.searchParams.get("url"));
  if (!source) {
    return NextResponse.json({ message: "Invalid image source" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(source.toString(), {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "User-Agent": "DASM Stores image proxy",
      },
      next: { revalidate },
    });
  } catch {
    return NextResponse.redirect(source.toString(), 307);
  }

  if (!upstream.ok) {
    return NextResponse.redirect(source.toString(), 307);
  }

  const contentType = upstream.headers.get("content-type") || "";
  const inferredContentType = inferImageContentType(source.pathname);
  if (contentType && !contentType.startsWith("image/") && !inferredContentType) {
    return NextResponse.json({ message: "Unsupported media type" }, { status: 415 });
  }

  return new NextResponse(await upstream.arrayBuffer(), {
    headers: {
      "Cache-Control": CACHE_CONTROL,
      "Content-Type": contentType.startsWith("image/") ? contentType : inferredContentType || "image/jpeg",
    },
  });
}
