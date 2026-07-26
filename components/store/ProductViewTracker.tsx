"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  hasMarketingConsent,
  MARKETING_CONSENT_EVENT,
} from "@/lib/marketing-consent";
import {
  createMarketingEventId,
  getConfiguredProductEventProviders,
  trackViewContent,
  type MarketingProvider,
  type MarketingTrackingConfig,
} from "@/lib/marketing-tracking";

export function ProductViewTracker({
  storeSlug,
  config,
  productId,
  productName,
  price,
}: {
  storeSlug: string;
  config?: MarketingTrackingConfig | null;
  productId: string | number;
  productName: string;
  price: number;
}) {
  const fired = useRef(false);
  const productKey = `${storeSlug}:${productId}`;
  const lastProductKey = useRef(productKey);
  const eventId = useMemo(
    () => createMarketingEventId(storeSlug, "view", String(productId)),
    [storeSlug, productId],
  );

  useEffect(() => {
    if (lastProductKey.current !== productKey) {
      fired.current = false;
      lastProductKey.current = productKey;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const trackedProviders = new Set<MarketingProvider>();

    const attemptTracking = (remainingAttempts = 20) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (fired.current || !hasMarketingConsent(storeSlug)) return;

        trackViewContent(
          storeSlug,
          config,
          {
            content_id: String(productId),
            content_name: productName,
            value: price,
          },
          {
            event_id: eventId,
            skip_providers: [...trackedProviders],
          },
        ).forEach((provider) => trackedProviders.add(provider));

        const configured = getConfiguredProductEventProviders(config);
        if (configured.every((provider) => trackedProviders.has(provider))) {
          fired.current = true;
        } else if (remainingAttempts > 0) {
          attemptTracking(remainingAttempts - 1);
        }
      }, 500);
    };

    const handleConsentChange = () => attemptTracking();

    attemptTracking();
    window.addEventListener(MARKETING_CONSENT_EVENT, handleConsentChange);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener(MARKETING_CONSENT_EVENT, handleConsentChange);
    };
  }, [storeSlug, config, productId, productName, price, productKey, eventId]);

  return null;
}
