"use client";

import { useMemo, useState } from "react";
import { proxiedProductImageSrc } from "@/lib/image-proxy";

/**
 * Storefront product image with graceful fallback. Avoids the broken-img /
 * alt-text flash when a source 404s or hasn't loaded by showing a neutral
 * placeholder instead.
 */
export function ProductImage({ src, alt }: { src?: string | null; alt: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [directFallbackSrc, setDirectFallbackSrc] = useState<string | null>(null);
  const directSrc = useMemo(() => {
    const value = src?.trim();
    if (!value) return null;
    return value.replace(/ /g, "%20");
  }, [src]);

  const proxiedSrc = useMemo(() => proxiedProductImageSrc(directSrc), [directSrc]);
  const activeSrc = directFallbackSrc === directSrc ? directSrc : proxiedSrc;
  const failed = Boolean(activeSrc && failedSrc === activeSrc);

  if (!activeSrc || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--muted),color-mix(in_srgb,var(--primary)_10%,var(--muted)))] text-xs text-[var(--muted-foreground)]">
        <span className="rounded-full border border-[var(--border)] bg-[var(--card)]/80 px-3 py-1">
          بدون صورة
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={activeSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (directSrc && activeSrc !== directSrc) {
          setDirectFallbackSrc(directSrc);
          return;
        }
        setFailedSrc(activeSrc);
      }}
      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
    />
  );
}
