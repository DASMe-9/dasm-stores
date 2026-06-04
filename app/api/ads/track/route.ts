import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ADS_API_URL = "https://ads.dasm.com.sa/ads";

function adsApiUrl(): string {
  return (
    process.env.DASM_ADS_API_URL ||
    process.env.NEXT_PUBLIC_DASM_ADS_API_URL ||
    DEFAULT_ADS_API_URL
  ).replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  try {
    const upstream = await fetch(`${adsApiUrl()}/track`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    const data = await upstream.json().catch(() => ({ ok: false }));
    if (!upstream.ok) {
      return NextResponse.json(
        { ok: false, error: "ads_unavailable", upstream_status: upstream.status },
        { status: 200 },
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ads_unavailable";
    console.error("[ads-track-proxy] error:", message);
    return NextResponse.json({ ok: false, error: "ads_unavailable" }, { status: 200 });
  }
}
