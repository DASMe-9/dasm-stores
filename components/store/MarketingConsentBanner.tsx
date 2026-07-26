"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getMarketingConsent,
  resetMarketingConsent,
  revokeLoadedMarketingConsent,
  setMarketingConsent,
  subscribeToMarketingConsent,
  type MarketingConsentState,
} from "@/lib/marketing-consent";
import {
  hasActivePixels,
  type MarketingTrackingConfig,
} from "@/lib/marketing-tracking";

export function MarketingConsentBanner({
  storeSlug,
  config,
}: {
  storeSlug: string;
  config?: MarketingTrackingConfig | null;
}) {
  const [consent, setConsent] =
    useState<MarketingConsentState>("unknown");

  useEffect(() => {
    let active = true;
    const syncConsent = () => {
      if (active) setConsent(getMarketingConsent(storeSlug));
    };
    const unsubscribe = subscribeToMarketingConsent(storeSlug, syncConsent);
    queueMicrotask(syncConsent);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [storeSlug]);

  if (!hasActivePixels(config)) {
    return null;
  }

  if (consent !== "unknown") {
    const openSettings = () => {
      revokeLoadedMarketingConsent();
      resetMarketingConsent(storeSlug);
      window.location.reload();
    };

    return (
      <button
        type="button"
        onClick={openSettings}
        className="fixed bottom-3 left-3 z-[90] rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] shadow-lg"
      >
        إعدادات الخصوصية
      </button>
    );
  }

  function choose(nextConsent: "granted" | "denied") {
    setMarketingConsent(storeSlug, nextConsent);
    window.location.reload();
  }

  return (
    <section
      dir="rtl"
      role="dialog"
      aria-live="polite"
      aria-label="خيارات ملفات الارتباط"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--foreground)] shadow-2xl sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6">
          نستخدم أدوات قياس إعلانية لمساعدة هذا المتجر على فهم أداء حملاته.
          لن نفعّلها قبل موافقتك.{" "}
          <Link className="font-semibold underline" href={`/${storeSlug}/p/privacy`}>
            سياسة الخصوصية
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold"
          >
            رفض
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
          >
            موافق
          </button>
        </div>
      </div>
    </section>
  );
}
