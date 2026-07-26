import { hasMarketingConsent } from "@/lib/marketing-consent";

export type MarketingTrackingConfig = {
  enabled?: boolean;
  tiktok_pixel_id?: string | null;
  snap_pixel_id?: string | null;
  meta_pixel_id?: string | null;
  google_ads_id?: string | null;
  google_conversion_label?: string | null;
};

export type MarketingProvider = "tiktok" | "snap" | "meta" | "google";

export type PurchaseTrackingItem = {
  content_id: string;
  content_name?: string;
  quantity: number;
  price: number;
};

type TikTokQueue = {
  track?: (
    event: string,
    payload?: Record<string, unknown>,
    options?: { event_id: string },
  ) => void;
  instance?: (pixelId: string) => TikTokQueue;
};

declare global {
  interface Window {
    ttq?: TikTokQueue;
    snaptr?: (command: string, ...args: unknown[]) => void;
    fbq?: (command: string, ...args: unknown[]) => void;
    gtag?: (command: string, ...args: unknown[]) => void;
  }
}

const TRACKING_ID_PATTERN = /^[A-Za-z0-9_-]{3,80}$/;
const PURCHASE_STORAGE_PREFIX = "dasm:marketing-purchase:v1:";
const volatilePurchaseProviders = new Map<string, MarketingProvider[]>();

export function normalizeTrackingId(value?: string | null): string | null {
  const normalized = value?.trim();
  return normalized && TRACKING_ID_PATTERN.test(normalized) ? normalized : null;
}

export function hasActivePixels(config?: MarketingTrackingConfig | null): boolean {
  if (!config?.enabled) return false;
  return Boolean(
    normalizeTrackingId(config.tiktok_pixel_id) ||
      normalizeTrackingId(config.snap_pixel_id) ||
      normalizeTrackingId(config.meta_pixel_id) ||
      normalizeTrackingId(config.google_ads_id),
  );
}

export function getConfiguredMarketingProviders(
  config?: MarketingTrackingConfig | null,
): MarketingProvider[] {
  if (!config?.enabled) return [];

  const providers: MarketingProvider[] = [];
  if (normalizeTrackingId(config.tiktok_pixel_id)) providers.push("tiktok");
  if (normalizeTrackingId(config.snap_pixel_id)) providers.push("snap");
  if (normalizeTrackingId(config.meta_pixel_id)) providers.push("meta");
  if (
    normalizeTrackingId(config.google_ads_id) &&
    normalizeTrackingId(config.google_conversion_label)
  ) {
    providers.push("google");
  }
  return providers;
}

export function getConfiguredProductEventProviders(
  config?: MarketingTrackingConfig | null,
): MarketingProvider[] {
  if (!config?.enabled) return [];

  const providers: MarketingProvider[] = [];
  if (normalizeTrackingId(config.tiktok_pixel_id)) providers.push("tiktok");
  if (normalizeTrackingId(config.snap_pixel_id)) providers.push("snap");
  if (normalizeTrackingId(config.meta_pixel_id)) providers.push("meta");
  return providers;
}

export function createMarketingEventId(
  storeSlug: string,
  event: string,
  contentId: string,
): string {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `dasm:${storeSlug}:${event}:${contentId}:${randomPart}`;
}

function purchaseEventId(storeSlug: string, orderId: string): string {
  return `dasm:${storeSlug}:purchase:${orderId}`;
}

function purchaseStorageKey(storeSlug: string, orderId: string): string {
  return `${PURCHASE_STORAGE_PREFIX}${storeSlug}:${orderId}`;
}

export function getTrackedPurchaseProviders(
  storeSlug: string,
  orderId: string,
): MarketingProvider[] {
  if (typeof window === "undefined") return [];

  const key = purchaseStorageKey(storeSlug, orderId);
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(key) ??
        JSON.stringify(volatilePurchaseProviders.get(key) ?? []),
    );
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((provider): provider is MarketingProvider =>
      ["tiktok", "snap", "meta", "google"].includes(provider),
    );
  } catch {
    return volatilePurchaseProviders.get(key) ?? [];
  }
}

function markPurchaseProvider(
  storeSlug: string,
  orderId: string,
  provider: MarketingProvider,
): void {
  if (typeof window === "undefined") return;

  const providers = new Set(getTrackedPurchaseProviders(storeSlug, orderId));
  providers.add(provider);
  const key = purchaseStorageKey(storeSlug, orderId);
  const nextProviders = [...providers];
  volatilePurchaseProviders.set(key, nextProviders);
  try {
    window.localStorage.setItem(key, JSON.stringify(nextProviders));
  } catch {
    // In-memory deduplication still protects the current page session.
  }
}

function canTrack(
  storeSlug: string,
  config?: MarketingTrackingConfig | null,
): config is MarketingTrackingConfig {
  return (
    typeof window !== "undefined" &&
    hasActivePixels(config) &&
    hasMarketingConsent(storeSlug)
  );
}

export function trackViewContent(
  storeSlug: string,
  config: MarketingTrackingConfig | null | undefined,
  payload: {
    content_id: string;
    content_name: string;
    value: number;
    currency?: string;
  },
  options?: {
    event_id?: string;
    skip_providers?: MarketingProvider[];
  },
): MarketingProvider[] {
  if (!canTrack(storeSlug, config)) return [];

  const id =
    options?.event_id ??
    createMarketingEventId(storeSlug, "view", payload.content_id);
  const skipped = new Set(options?.skip_providers ?? []);
  const tracked: MarketingProvider[] = [];
  const currency = payload.currency ?? "SAR";
  const tiktokId = normalizeTrackingId(config.tiktok_pixel_id);
  const metaId = normalizeTrackingId(config.meta_pixel_id);

  if (!skipped.has("tiktok") && tiktokId) {
    const tiktok = window.ttq?.instance?.(tiktokId);
    if (tiktok?.track) {
      tiktok.track(
        "ViewContent",
        {
          content_id: payload.content_id,
          content_name: payload.content_name,
          content_type: "product",
          value: payload.value,
          currency,
        },
        { event_id: id },
      );
      tracked.push("tiktok");
    }
  }

  if (
    !skipped.has("snap") &&
    normalizeTrackingId(config.snap_pixel_id) &&
    window.snaptr
  ) {
    window.snaptr("track", "VIEW_CONTENT", {
      item_ids: [payload.content_id],
      price: payload.value,
      currency,
      client_dedup_id: id,
    });
    tracked.push("snap");
  }

  if (!skipped.has("meta") && metaId && window.fbq) {
    window.fbq(
      "trackSingle",
      metaId,
      "ViewContent",
      {
        content_ids: [payload.content_id],
        content_name: payload.content_name,
        content_type: "product",
        value: payload.value,
        currency,
      },
      { eventID: id },
    );
    tracked.push("meta");
  }

  return tracked;
}

export function trackAddToCart(
  storeSlug: string,
  config: MarketingTrackingConfig | null | undefined,
  payload: {
    content_id: string;
    content_name: string;
    value: number;
    quantity?: number;
    currency?: string;
  },
): void {
  if (!canTrack(storeSlug, config)) return;

  const id = createMarketingEventId(
    storeSlug,
    "add-to-cart",
    payload.content_id,
  );
  const currency = payload.currency ?? "SAR";
  const quantity = payload.quantity ?? 1;
  const tiktokId = normalizeTrackingId(config.tiktok_pixel_id);
  const metaId = normalizeTrackingId(config.meta_pixel_id);

  if (tiktokId) {
    window.ttq?.instance?.(tiktokId)?.track?.(
      "AddToCart",
      {
        content_id: payload.content_id,
        content_name: payload.content_name,
        content_type: "product",
        contents: [{ content_id: payload.content_id, quantity, price: payload.value }],
        value: payload.value * quantity,
        currency,
      },
      { event_id: id },
    );
  }

  if (normalizeTrackingId(config.snap_pixel_id)) {
    window.snaptr?.("track", "ADD_CART", {
      item_ids: [payload.content_id],
      number_items: quantity,
      price: payload.value * quantity,
      currency,
      client_dedup_id: id,
    });
  }

  if (metaId) {
    window.fbq?.(
      "trackSingle",
      metaId,
      "AddToCart",
      {
        content_ids: [payload.content_id],
        content_name: payload.content_name,
        content_type: "product",
        contents: [{ id: payload.content_id, quantity }],
        value: payload.value * quantity,
        currency,
      },
      { eventID: id },
    );
  }
}

export function trackPurchase(
  storeSlug: string,
  config: MarketingTrackingConfig | null | undefined,
  payload: {
    order_id: string;
    value: number;
    items: PurchaseTrackingItem[];
    currency?: string;
  },
): MarketingProvider[] {
  if (!canTrack(storeSlug, config) || payload.value <= 0 || payload.items.length === 0) {
    return [];
  }

  const alreadyTracked = new Set(
    getTrackedPurchaseProviders(storeSlug, payload.order_id),
  );
  const tracked: MarketingProvider[] = [];
  const id = purchaseEventId(storeSlug, payload.order_id);
  const currency = payload.currency ?? "SAR";
  const contentIds = payload.items.map((item) => item.content_id);
  const quantity = payload.items.reduce((sum, item) => sum + item.quantity, 0);
  const tiktokId = normalizeTrackingId(config.tiktok_pixel_id);
  const metaId = normalizeTrackingId(config.meta_pixel_id);

  if (!alreadyTracked.has("tiktok") && tiktokId) {
    const tiktok = window.ttq?.instance?.(tiktokId);
    if (tiktok?.track) {
      tiktok.track(
        "CompletePayment",
        {
          content_type: "product",
          contents: payload.items,
          value: payload.value,
          currency,
        },
        { event_id: id },
      );
      tracked.push("tiktok");
    }
  }

  if (
    !alreadyTracked.has("snap") &&
    normalizeTrackingId(config.snap_pixel_id) &&
    window.snaptr
  ) {
    window.snaptr("track", "PURCHASE", {
      transaction_id: payload.order_id,
      item_ids: contentIds,
      number_items: quantity,
      price: payload.value,
      currency,
      client_dedup_id: id,
    });
    tracked.push("snap");
  }

  if (!alreadyTracked.has("meta") && metaId && window.fbq) {
    window.fbq(
      "trackSingle",
      metaId,
      "Purchase",
      {
        content_ids: contentIds,
        content_type: "product",
        contents: payload.items.map((item) => ({
          id: item.content_id,
          quantity: item.quantity,
          item_price: item.price,
        })),
        value: payload.value,
        currency,
      },
      { eventID: id },
    );
    tracked.push("meta");
  }

  if (
    !alreadyTracked.has("google") &&
    normalizeTrackingId(config.google_ads_id) &&
    normalizeTrackingId(config.google_conversion_label) &&
    window.gtag
  ) {
    window.gtag("event", "conversion", {
      send_to: `${config.google_ads_id}/${config.google_conversion_label}`,
      value: payload.value,
      currency,
      transaction_id: payload.order_id,
      items: payload.items.map((item) => ({
        item_id: item.content_id,
        item_name: item.content_name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
    tracked.push("google");
  }

  tracked.forEach((provider) =>
    markPurchaseProvider(storeSlug, payload.order_id, provider),
  );

  return tracked;
}
