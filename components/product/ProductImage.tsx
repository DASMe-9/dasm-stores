"use client";

import { useState } from "react";

/**
 * Storefront product image with graceful fallback. Avoids the broken-img /
 * alt-text flash when a source 404s or hasn't loaded — shows a neutral
 * placeholder instead. Client island inside the (server) ProductCard.
 */
export function ProductImage({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted-foreground)]">
        بدون صورة
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
    />
  );
}
