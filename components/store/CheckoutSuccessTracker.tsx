"use client";

import { useEffect } from "react";
import { checkoutApi } from "@/lib/api";
import { MARKETING_CONSENT_EVENT } from "@/lib/marketing-consent";
import type {
  MarketingTrackingConfig,
  PurchaseTrackingItem,
} from "@/lib/marketing-tracking";
import {
  getConfiguredMarketingProviders,
  getTrackedPurchaseProviders,
  trackPurchase,
} from "@/lib/marketing-tracking";

type PaidOrderPayload = {
  order_id: string;
  value: number;
  items: PurchaseTrackingItem[];
};

export function CheckoutSuccessTracker({
  slug,
  orderNumber,
  orderSignature,
  config,
}: {
  slug: string;
  orderNumber?: string | null;
  orderSignature?: string | null;
  config?: MarketingTrackingConfig | null;
}) {
  useEffect(() => {
    if (!orderNumber || !orderSignature) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let purchase: PaidOrderPayload | null = null;

    const attemptTracking = (remainingAttempts = 20) => {
      if (cancelled || !purchase) return;

      trackPurchase(slug, config, purchase);
      const configured = getConfiguredMarketingProviders(config);
      const tracked = getTrackedPurchaseProviders(slug, purchase.order_id);
      const complete = configured.every((provider) => tracked.includes(provider));

      if (!complete && remainingAttempts > 0) {
        retryTimer = setTimeout(
          () => attemptTracking(remainingAttempts - 1),
          500,
        );
      }
    };

    const handleConsentChange = () => {
      if (retryTimer) clearTimeout(retryTimer);
      attemptTracking();
    };

    window.addEventListener(MARKETING_CONSENT_EVENT, handleConsentChange);

    void checkoutApi
      .trackOrder(slug, orderNumber, orderSignature)
      .then((response) => {
        if (cancelled) return;

        const order = response.data?.order;
        const total = Number(order?.total ?? 0);
        if (
          response.data?.marketing_purchase_eligible !== true ||
          order?.payment_status !== "paid" ||
          total <= 0
        ) {
          return;
        }

        const items = Array.isArray(response.data?.items)
          ? response.data.items
              .map((item: Record<string, unknown>): PurchaseTrackingItem | null => {
                const contentId = String(
                  item.catalog_content_id ?? item.product_id ?? "",
                );
                const quantity = Number(item.quantity ?? 0);
                const price = Number(item.unit_price ?? 0);
                if (!contentId || quantity <= 0 || price < 0) return null;

                return {
                  content_id: contentId,
                  content_name:
                    typeof item.product_name === "string"
                      ? item.product_name
                      : undefined,
                  quantity,
                  price,
                };
              })
              .filter(
                (item: PurchaseTrackingItem | null): item is PurchaseTrackingItem =>
                  item !== null,
              )
          : [];

        if (items.length === 0) return;
        purchase = { order_id: orderNumber, value: total, items };
        attemptTracking();
      })
      .catch(() => {
        // Never report a purchase when the paid order cannot be verified.
      });

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      window.removeEventListener(MARKETING_CONSENT_EVENT, handleConsentChange);
    };
  }, [slug, orderNumber, orderSignature, config]);

  return null;
}
