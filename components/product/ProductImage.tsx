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
  const normalizedSrc = useMemo(() => {
    const value = src?.trim();
    if (!value) return null;
    return proxiedProductImageSrc(value.replace(/ /g, "%20"));
  }, [src]);

  const failed = Boolean(normalizedSrc && failedSrc === normalizedSrc);

  if (!normalizedSrc || failed) {
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
      src={normalizedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(normalizedSrc)}
      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
    />
  );
}
