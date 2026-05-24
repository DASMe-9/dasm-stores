"use client";

import { useEffect, useRef } from "react";
import { checkoutApi } from "@/lib/api";
import type { MarketingTrackingConfig } from "@/lib/marketing-tracking";
import { trackPurchase } from "@/lib/marketing-tracking";

export function CheckoutSuccessTracker({
  slug,
  orderNumber,
  config,
}: {
  slug: string;
  orderNumber?: string | null;
  config?: MarketingTrackingConfig | null;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (!orderNumber || fired.current) return;
    fired.current = true;

    void checkoutApi.trackOrder(slug, orderNumber).then((res) => {
      const total = Number(res.data?.order?.total ?? 0);
      if (total <= 0) return;
      trackPurchase(config, { order_id: orderNumber, value: total });
    }).catch(() => {
      trackPurchase(config, { order_id: orderNumber, value: 0 });
    });
  }, [slug, orderNumber, config]);

  return null;
}
