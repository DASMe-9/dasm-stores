import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  resetMarketingConsent,
  setMarketingConsent,
} from "@/lib/marketing-consent";
import {
  getTrackedPurchaseProviders,
  trackPurchase,
  trackViewContent,
  type MarketingTrackingConfig,
} from "@/lib/marketing-tracking";

function createStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

const config: MarketingTrackingConfig = {
  enabled: true,
  tiktok_pixel_id: "TIKTOK123",
  snap_pixel_id: "SNAP123",
  meta_pixel_id: "META123",
  google_ads_id: "AW-123456",
  google_conversion_label: "AbCdEf123",
};

describe("marketing tracking", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      "CustomEvent",
      class {
        constructor(
          public type: string,
          public init?: CustomEventInit,
        ) {}
      },
    );
    vi.stubGlobal("window", {
      localStorage: createStorage(),
      dispatchEvent: vi.fn(),
    });
    resetMarketingConsent("cheerly-live");
  });

  it("does not send events before the visitor grants consent", () => {
    const track = vi.fn();
    window.ttq = { instance: vi.fn(() => ({ track })) };

    trackViewContent("cheerly-live", config, {
      content_id: "product-1",
      content_name: "Product",
      value: 25,
    });

    expect(track).not.toHaveBeenCalled();
  });

  it("does not reuse consent or executable pixel ids across stores", () => {
    const track = vi.fn();
    window.ttq = { instance: vi.fn(() => ({ track })) };
    setMarketingConsent("cheerly-live", "granted");

    trackViewContent(
      "another-store",
      {
        enabled: true,
        tiktok_pixel_id: `PIXEL";alert("unsafe")`,
      },
      {
        content_id: "product-1",
        content_name: "Product",
        value: 25,
      },
    );

    expect(track).not.toHaveBeenCalled();
  });

  it("isolates browser events to the configured store pixels", () => {
    const track = vi.fn();
    const instance = vi.fn(() => ({ track }));
    const snaptr = vi.fn();
    const fbq = vi.fn();
    window.ttq = { instance };
    window.snaptr = snaptr;
    window.fbq = fbq;
    setMarketingConsent("cheerly-live", "granted");

    trackViewContent("cheerly-live", config, {
      content_id: "product-1",
      content_name: "Product",
      value: 25,
    });

    expect(instance).toHaveBeenCalledWith("TIKTOK123");
    expect(track).toHaveBeenCalledWith(
      "ViewContent",
      expect.objectContaining({
        content_id: "product-1",
        content_type: "product",
      }),
      expect.objectContaining({
        event_id: expect.stringContaining("dasm:cheerly-live:view:product-1:"),
      }),
    );
    expect(snaptr).toHaveBeenCalledWith(
      "track",
      "VIEW_CONTENT",
      expect.objectContaining({ item_ids: ["product-1"] }),
    );
    expect(fbq).toHaveBeenCalledWith(
      "trackSingle",
      "META123",
      "ViewContent",
      expect.objectContaining({ content_ids: ["product-1"] }),
      expect.any(Object),
    );
  });

  it("uses paid order product ids and deduplicates each provider", () => {
    const tiktokTrack = vi.fn();
    const snaptr = vi.fn();
    const fbq = vi.fn();
    const gtag = vi.fn();
    window.ttq = { instance: vi.fn(() => ({ track: tiktokTrack })) };
    window.snaptr = snaptr;
    window.fbq = fbq;
    window.gtag = gtag;
    setMarketingConsent("cheerly-live", "granted");

    const purchase = {
      order_id: "DASM-STR-100",
      value: 75,
      items: [
        {
          content_id: "product-1",
          content_name: "Product",
          quantity: 3,
          price: 25,
        },
      ],
    };

    expect(trackPurchase("cheerly-live", config, purchase)).toEqual([
      "tiktok",
      "snap",
      "meta",
      "google",
    ]);
    expect(tiktokTrack).toHaveBeenCalledWith(
      "CompletePayment",
      expect.objectContaining({
        contents: [
          expect.objectContaining({
            content_id: "product-1",
            quantity: 3,
          }),
        ],
      }),
      { event_id: "dasm:cheerly-live:purchase:DASM-STR-100" },
    );
    expect(snaptr).toHaveBeenCalledWith(
      "track",
      "PURCHASE",
      expect.objectContaining({
        item_ids: ["product-1"],
        transaction_id: "DASM-STR-100",
      }),
    );
    expect(fbq).toHaveBeenCalledWith(
      "trackSingle",
      "META123",
      "Purchase",
      expect.objectContaining({ content_ids: ["product-1"] }),
      { eventID: "dasm:cheerly-live:purchase:DASM-STR-100" },
    );

    expect(trackPurchase("cheerly-live", config, purchase)).toEqual([]);
    expect(tiktokTrack).toHaveBeenCalledTimes(1);
    expect(snaptr).toHaveBeenCalledTimes(1);
    expect(fbq).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "conversion",
      expect.objectContaining({ send_to: "AW-123456/AbCdEf123" }),
    );
    expect(getTrackedPurchaseProviders("cheerly-live", purchase.order_id)).toEqual([
      "tiktok",
      "snap",
      "meta",
      "google",
    ]);
  });
});
