export type MarketingTrackingConfig = {
  enabled?: boolean;
  tiktok_pixel_id?: string | null;
  snap_pixel_id?: string | null;
  meta_pixel_id?: string | null;
  google_ads_id?: string | null;
};

declare global {
  interface Window {
    ttq?: {
      track: (event: string, payload?: Record<string, unknown>) => void;
      page: () => void;
    };
    snaptr?: (command: string, ...args: unknown[]) => void;
    fbq?: (command: string, ...args: unknown[]) => void;
    gtag?: (command: string, ...args: unknown[]) => void;
  }
}

export function hasActivePixels(config?: MarketingTrackingConfig | null): boolean {
  if (!config?.enabled) return false;
  return Boolean(
    config.tiktok_pixel_id ||
      config.snap_pixel_id ||
      config.meta_pixel_id ||
      config.google_ads_id,
  );
}

export function trackViewContent(
  config: MarketingTrackingConfig | null | undefined,
  payload: { content_id: string; content_name: string; value: number; currency?: string },
) {
  if (!hasActivePixels(config)) return;

  const data = {
    content_id: payload.content_id,
    content_name: payload.content_name,
    value: payload.value,
    currency: payload.currency ?? "SAR",
  };

  window.ttq?.track("ViewContent", data);
  window.snaptr?.("track", "VIEW_CONTENT", data);
  window.fbq?.("track", "ViewContent", data);
}

export function trackAddToCart(
  config: MarketingTrackingConfig | null | undefined,
  payload: { content_id: string; content_name: string; value: number; quantity?: number; currency?: string },
) {
  if (!hasActivePixels(config)) return;

  const data = {
    content_id: payload.content_id,
    content_name: payload.content_name,
    value: payload.value,
    quantity: payload.quantity ?? 1,
    currency: payload.currency ?? "SAR",
  };

  window.ttq?.track("AddToCart", data);
  window.snaptr?.("track", "ADD_CART", data);
  window.fbq?.("track", "AddToCart", data);
}

export function trackPurchase(
  config: MarketingTrackingConfig | null | undefined,
  payload: { order_id: string; value: number; currency?: string },
) {
  if (!hasActivePixels(config)) return;

  const data = {
    content_ids: [payload.order_id],
    value: payload.value,
    currency: payload.currency ?? "SAR",
  };

  window.ttq?.track("CompletePayment", { ...data, content_type: "product" });
  window.snaptr?.("track", "PURCHASE", data);
  window.fbq?.("track", "Purchase", data);

  if (config?.google_ads_id && window.gtag) {
    window.gtag("event", "conversion", {
      send_to: `${config.google_ads_id}/purchase`,
      value: payload.value,
      currency: payload.currency ?? "SAR",
      transaction_id: payload.order_id,
    });
  }
}
