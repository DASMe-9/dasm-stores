import type { NextApiRequest, NextApiResponse } from "next";
import { resolveServerPlatformApiOrigin } from "@/lib/platform-api-url";

const DEFAULT_ADS_API_URL = "https://ads.dasm.com.sa/api/ads";

/**
 * Ad results for the merchant's OWN store.
 *
 * Two things must not happen, and both are why this is a server route rather
 * than a browser call:
 *
 *  1. The ads engine's internal token must never reach a browser. Anyone
 *     holding it can read any merchant's numbers.
 *  2. The store whose results are read is resolved HERE, from the caller's
 *     verified platform session (`/api/my-store`) — never from a parameter the
 *     client sends. Otherwise changing one number in a request would show a
 *     merchant their competitor's spend and conversions.
 */

function adsApiUrl(): string {
  return (
    process.env.DASM_ADS_API_URL ||
    process.env.NEXT_PUBLIC_DASM_ADS_API_URL ||
    DEFAULT_ADS_API_URL
  ).replace(/\/$/, "");
}

function callerToken(req: NextApiRequest): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7).trim() || null;

  const cookie = req.cookies?.stores_token;
  return cookie ? decodeURIComponent(cookie) : null;
}

/**
 * The store this caller owns, according to the platform — not the client.
 *
 * A merchant may own several stores, so the client's selection header is
 * forwarded; the platform still decides whether that selection belongs to this
 * token, which is what keeps one merchant out of another's numbers.
 */
async function resolveOwnStore(
  token: string,
  selectedStoreId?: string,
): Promise<{ id: string; name?: string } | null> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  if (selectedStoreId) headers["X-DASM-Store-Id"] = selectedStoreId;

  const res = await fetch(`${resolveServerPlatformApiOrigin()}/api/stores/my-store`, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  if (!res.ok) return null;

  const payload = (await res.json().catch(() => null)) as
    | { store?: { id?: unknown; name?: unknown } }
    | null;

  const id = payload?.store?.id;
  if (id === undefined || id === null || id === "") return null;

  return {
    id: String(id),
    name: typeof payload?.store?.name === "string" ? payload.store.name : undefined,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const token = callerToken(req);
  if (!token) return res.status(401).json({ error: "unauthenticated" });

  const internalToken = process.env.ADS_INTERNAL_TOKEN;
  if (!internalToken) {
    console.warn("[ads-report] ADS_INTERNAL_TOKEN is not set; cannot read ad results");
    return res.status(503).json({ error: "not_configured" });
  }

  let store: { id: string; name?: string } | null;

  try {
    const selected = req.headers["x-dasm-store-id"];
    store = await resolveOwnStore(token, typeof selected === "string" ? selected : undefined);
  } catch {
    return res.status(502).json({ error: "platform_unavailable" });
  }

  if (!store) return res.status(403).json({ error: "no_store_for_caller" });

  const params = new URLSearchParams({
    destination_type: "store",
    destination_id: store.id,
  });

  // Only the window is taken from the client — never the identity.
  const { from, to } = req.query;
  if (typeof from === "string" && from) params.set("from", from);
  if (typeof to === "string" && to) params.set("to", to);

  try {
    const upstream = await fetch(`${adsApiUrl()}/internal/destination-report?${params.toString()}`, {
      headers: { Accept: "application/json", "X-Ads-Internal-Token": internalToken },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    const data = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      return res.status(502).json({ error: "ads_unavailable", upstream_status: upstream.status });
    }

    return res.status(200).json({ ...data, store_name: store.name ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ads_unavailable";
    console.error("[ads-report] error:", message);

    return res.status(502).json({ error: "ads_unavailable" });
  }
}
