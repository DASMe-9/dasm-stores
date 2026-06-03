"use client";

import { useEffect, useRef, useState } from "react";
import {
  type AdSlotContext,
  type DasmAd,
  getAdsSessionId,
  serveAds,
  trackAdEvent,
} from "@/lib/ads-client";

interface StoreAdSlotProps {
  slotKey: string;
  context?: AdSlotContext;
  className?: string;
}

export function StoreAdSlot({ slotKey, context = {}, className = "" }: StoreAdSlotProps) {
  const [ad, setAd] = useState<DasmAd | null>(null);
  const impressionTracked = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const sessionId = getAdsSessionId();

    serveAds(slotKey, sessionId, context).then((ads) => {
      if (cancelled) return;
      if (ads.length > 0) {
        setAd(ads[0]);
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotKey]);

  useEffect(() => {
    if (ad && !impressionTracked.current) {
      impressionTracked.current = true;
      trackAdEvent(ad, "impression", getAdsSessionId(), { ...context, slot: slotKey });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad]);

  if (!ad) return null;

  const r = ad.rendered;
  const href = ad.target_url || "#";
  const sessionId = getAdsSessionId();

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-l from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 shadow-sm ${className}`} dir="rtl">
      {/* إعلان badge */}
      <span className="absolute right-3 top-3 z-10 rounded-full bg-emerald-100 dark:bg-emerald-800/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
        إعلان
      </span>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackAdEvent(ad, "click", sessionId, { ...context, slot: slotKey })}
        className="flex items-center gap-4 p-4 pt-8 transition hover:bg-emerald-100/40 dark:hover:bg-emerald-900/20"
      >
        {r?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={r.image_url}
            alt={r.headline ?? "إعلان"}
            className="h-16 w-16 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-300 text-2xl font-extrabold">
            🏷
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-1">
          {r?.headline && (
            <p className="line-clamp-1 text-sm font-extrabold text-slate-900 dark:text-zinc-100">
              {r.headline}
            </p>
          )}
          {r?.subtitle && (
            <p className="line-clamp-2 text-xs text-slate-600 dark:text-zinc-400">{r.subtitle}</p>
          )}
          <div className="flex items-center gap-3">
            {r?.price != null && (
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {typeof r.price === "number" ? `${r.price.toFixed(0)} ر.س` : r.price}
              </span>
            )}
            {r?.city && (
              <span className="text-xs text-slate-500 dark:text-zinc-400">{r.city}</span>
            )}
          </div>
        </div>

        {r?.cta && (
          <span className="shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700">
            {r.cta}
          </span>
        )}
      </a>
    </div>
  );
}
