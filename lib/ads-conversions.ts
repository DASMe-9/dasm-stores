"use client";

import { getAdsSessionId } from "./ads-client";

/**
 * Reporting what an ad actually produced on this storefront.
 *
 * A click from an ad on another DASM surface (clips, souq) lands here with a
 * different session id than the one the ad was served under, so session-based
 * attribution would lose it. The ad link therefore carries its signed serve
 * token as `dasm_ad`; we keep that token for the length of the attribution
 * window and attach it to whatever the visitor goes on to do.
 */

const AD_TOKEN_KEY = "dasm_ads_click_token";
const REPORTED_KEY_PREFIX = "dasm_ads_reported:";

/** Matches the engine's click attribution window. */
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type StoredToken = { token: string; at: number };

/**
 * Pull `dasm_ad` off the current URL and remember it.
 *
 * Returns the token in force now — the fresh one if this is an ad arrival, the
 * stored one otherwise.
 */
export function captureAdToken(): string | null {
  if (typeof window === "undefined") return null;

  const fromUrl = new URLSearchParams(window.location.search).get("dasm_ad");

  if (fromUrl) {
    try {
      const payload: StoredToken = { token: fromUrl, at: Date.now() };
      window.localStorage.setItem(AD_TOKEN_KEY, JSON.stringify(payload));
    } catch {
      // Private mode or a full quota. The visit below still reports with the
      // token in hand; only later purchases lose the strong attribution.
    }

    return fromUrl;
  }

  return getAdToken();
}

/** The remembered click token, if one is still inside the window. */
export function getAdToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AD_TOKEN_KEY);
    if (!raw) return null;

    const payload = JSON.parse(raw) as StoredToken;
    if (!payload?.token) return null;

    if (Date.now() - payload.at > TOKEN_TTL_MS) {
      window.localStorage.removeItem(AD_TOKEN_KEY);
      return null;
    }

    return payload.token;
  } catch {
    return null;
  }
}

/**
 * True the first time this key is seen in this browser.
 *
 * The engine already de-duplicates on `external_ref`, so this is only to avoid
 * pointless network calls on a re-render or a back-navigation.
 */
export function markReportedOnce(key: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const storageKey = `${REPORTED_KEY_PREFIX}${key}`;
    if (window.sessionStorage.getItem(storageKey)) return false;

    window.sessionStorage.setItem(storageKey, "1");
    return true;
  } catch {
    return true;
  }
}

export async function reportAdConversion(
  event: "store.visit.from_ad" | "store.product.purchase",
  options: {
    externalRef: string;
    valueSar?: number | null;
    meta?: Record<string, unknown> | null;
  },
): Promise<void> {
  const trackingToken = getAdToken();

  // Nothing ties this visitor to an ad. Reporting anyway would push an
  // unattributed row into the engine for every shopper who ever arrives.
  if (!trackingToken) return;

  try {
    const sessionId = getAdsSessionId();

    await fetch("/api/ads/conversions", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        event,
        external_ref: options.externalRef,
        tracking_token: trackingToken,
        session_hash: await hashSessionId(sessionId),
        value_sar: options.valueSar ?? null,
        meta: options.meta ?? null,
      }),
    });
  } catch {
    // Deliberately silent — see the module docblock.
  }
}

/**
 * SHA-256 of the session id, matching what the ads engine stores.
 *
 * SubtleCrypto is unavailable on insecure origins; there the report goes
 * without a session hash and attributes by signed token only, which is the
 * stronger signal anyway.
 */
async function hashSessionId(sessionId: string): Promise<string | null> {
  if (typeof crypto === "undefined" || !crypto.subtle) return null;

  try {
    const bytes = new TextEncoder().encode(sessionId);
    const digest = await crypto.subtle.digest("SHA-256", bytes);

    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return null;
  }
}
