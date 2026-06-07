"use client";

import { useState } from "react";
import { proxiedProductImageSrc } from "@/lib/image-proxy";

export function ProductGallery({
  images,
  alt,
}: {
  images: { url: string; alt_text?: string | null }[];
  alt: string;
}) {
  const list = images?.length ? images : [];
  const [idx, setIdx] = useState(0);
  const main = list[idx] ?? null;

  if (!main) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--muted)] text-sm text-[var(--muted-foreground)]">
        لا توجد صور
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--muted)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={proxiedProductImageSrc(main.url) ?? main.url}
          alt={main.alt_text || alt}
          referrerPolicy="no-referrer"
          className="aspect-square w-full object-cover"
        />
      </div>
      {list.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((im, i) => (
            <button
              key={`${im.url}-${i}`}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === idx ? "border-[var(--primary)]" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proxiedProductImageSrc(im.url) ?? im.url}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
