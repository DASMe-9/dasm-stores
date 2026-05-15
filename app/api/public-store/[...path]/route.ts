import { NextResponse } from "next/server";
import { getApiBase } from "@/lib/api-server";

function targetUrl(path: string[]): string {
  const suffix = path.map((segment) => encodeURIComponent(segment)).join("/");
  return `${getApiBase()}/api/stores/public/${suffix}`;
}

/**
 * Browser-safe GET proxy for public catalog endpoints (cart hydration, etc.).
 * Forwards to: {API_BACKEND_URL}/api/stores/public/{...path}
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (!path?.length) {
    return NextResponse.json({ message: "missing path" }, { status: 400 });
  }

  const res = await fetch(targetUrl(path), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}

/**
 * POST proxy — أسعار الشحن (Tryoto / shipping-quote) من المتصفّح بدون CORS على اللارافيل.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (!path?.length) {
    return NextResponse.json({ message: "missing path" }, { status: 400 });
  }

  const bodyText = await request.text();

  const res = await fetch(targetUrl(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": request.headers.get("Content-Type") ?? "application/json",
    },
    body: bodyText.length ? bodyText : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}
