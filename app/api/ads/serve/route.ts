import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ADS_API_URL = "https://ads.dasm.com.sa/ads";

function adsApiUrl(): string {
  return (
    process.env.DASM_ADS_API_URL ||
    process.env.NEXT_PUBLIC_DASM_ADS_API_URL ||
    DEFAULT_ADS_API_URL
  ).replace(/\/$/, "");
}

export async function GET(req: NextRequest) {
  const upstreamUrl = `${adsApiUrl()}/serve?${req.nextUrl.searchParams.toString()}`;
  try {
    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    const data = await upstream.json().catch(() => ({ data: [] }));
    if (!upstream.ok) {
      return NextResponse.json(
        { data: [], error: "ads_unavailable", upstream_status: upstream.status },
        { status: 200 },
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ads_unavailable";
    console.error("[ads-serve-proxy] error:", message);
    return NextResponse.json({ data: [], error: "ads_unavailable" }, { status: 200 });
  }
}
