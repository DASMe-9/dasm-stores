import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ADS_API_URL = "https://ads.dasm.com.sa/api/ads";

/**
 * Conversion reporting proxy for the storefront.
 *
 * The conversion endpoint is guarded by a shared internal token, which must
 * never reach a browser — anyone holding it could fabricate conversions and
 * inflate an advertiser's reported return. The token lives here, server side,
 * and the client only ever posts to this route.
 *
 * The client sends an ALREADY-HASHED session identifier. Nothing personal
 * crosses this boundary: an event name, an amount, and a hash.
 *
 * A failure answers 202, not an error: a conversion report is telemetry
 * attached to something the shopper already completed. Their order must not
 * look broken because an ads service is briefly unavailable.
 */

// Only what a storefront can legitimately witness. Without the allowlist this
// route becomes a way to claim any conversion — including the high-value
// auction ones a store page has no business asserting.
const ALLOWED_EVENTS = new Set(["store.visit.from_ad", "store.product.purchase"]);

function adsApiUrl(): string {
  return (
    process.env.DASM_ADS_API_URL ||
    process.env.NEXT_PUBLIC_DASM_ADS_API_URL ||
    DEFAULT_ADS_API_URL
  ).replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
  const token = process.env.ADS_INTERNAL_TOKEN;

  if (!token) {
    // Not configured yet. Say so in the log — a missing secret must be
    // diagnosable, not a silent drop of every conversion this surface makes.
    console.warn("[ads-conversions-proxy] ADS_INTERNAL_TOKEN is not set; conversion dropped");

    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 202 });
  }

  let body: Record<string, unknown>;

  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const event = typeof body.event === "string" ? body.event : "";

  if (!ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ ok: false, error: "event_not_allowed" }, { status: 400 });
  }

  if (typeof body.external_ref !== "string" || body.external_ref.length === 0) {
    return NextResponse.json({ ok: false, error: "external_ref_required" }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${adsApiUrl()}/conversions`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Ads-Internal-Token": token,
      },
      body: JSON.stringify({
        event,
        external_ref: body.external_ref,
        tracking_token: body.tracking_token ?? null,
        session_hash: body.session_hash ?? null,
        value_sar: body.value_sar ?? null,
        meta: body.meta ?? null,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    const data = await upstream.json().catch(() => ({ ok: false }));

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ads_unavailable";
    console.error("[ads-conversions-proxy] error:", message);

    return NextResponse.json({ ok: false, error: "ads_unavailable" }, { status: 202 });
  }
}
