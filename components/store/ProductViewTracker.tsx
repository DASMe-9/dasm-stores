"use client";

import { useEffect, useRef } from "react";
import type { MarketingTrackingConfig } from "@/lib/marketing-tracking";
import { trackViewContent } from "@/lib/marketing-tracking";

export function ProductViewTracker({
  config,
  productId,
  productName,
  price,
}: {
  config?: MarketingTrackingConfig | null;
  productId: string | number;
  productName: string;
  price: number;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackViewContent(config, {
      content_id: String(productId),
      content_name: productName,
      value: price,
    });
  }, [config, productId, productName, price]);

  return null;
}
