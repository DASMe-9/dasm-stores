import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getApiBase } from "@/lib/api-server";

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function storesToken(): Promise<string | undefined> {
  const raw = (await cookies()).get("stores_token")?.value;
  if (!raw) return undefined;
  const token = decodeCookieValue(raw).trim();
  return token || undefined;
}

function targetUrl(path: string[], request: Request, ownerPreview: boolean): string {
  const suffix = path.map((segment) => encodeURIComponent(segment)).join("/");
  const url = new URL(`${getApiBase()}/api/stores/public/${suffix}`);
  const incoming = new URL(request.url);

  incoming.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  if (ownerPreview) {
    url.searchParams.set("preview", "true");
  }

  return url.toString();
}

/**
 * Browser-safe GET proxy for public catalog endpoints (cart hydration, etc.).
 * Forwards to: {API_BACKEND_URL}/api/stores/public/{...path}
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (!path?.length) {
    return NextResponse.json({ message: "missing path" }, { status: 400 });
  }

  const token = await storesToken();
  const ownerPreview = Boolean(token);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(targetUrl(path, request, ownerPreview), {
    headers,
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
 * POST proxy — أسعار الشحن (Tryoto / shipping-rates) من المتصفّح بدون CORS على اللارافيل.
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
  const token = await storesToken();
  const ownerPreview = Boolean(token);

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": request.headers.get("Content-Type") ?? "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(targetUrl(path, request, ownerPreview), {
    method: "POST",
    headers,
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
