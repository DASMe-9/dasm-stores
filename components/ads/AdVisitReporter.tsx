"use client";

import { useEffect } from "react";
import { captureAdToken, markReportedOnce, reportAdConversion } from "@/lib/ads-conversions";

/**
 * Records that an ad actually delivered someone to this storefront.
 *
 * Mounted on every store page: the ad link may point at the home page, a
 * category, or a single product, and all of them are the same outcome — a
 * visit that an ad paid for.
 *
 * Renders nothing and never blocks the page.
 */
export function AdVisitReporter({ storeSlug }: { storeSlug: string }) {
  useEffect(() => {
    const token = captureAdToken();
    if (!token) return;

    // One visit per ad click, not one per page the shopper then browses.
    if (!markReportedOnce(`visit:${storeSlug}:${token}`)) return;

    void reportAdConversion("store.visit.from_ad", {
      externalRef: `store.visit.from_ad:${storeSlug}:${token}`,
      meta: { store_slug: storeSlug },
    });
  }, [storeSlug]);

  return null;
}
