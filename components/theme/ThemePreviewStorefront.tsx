"use client";

import type { CSSProperties } from "react";
import { ShoppingBag } from "lucide-react";
import type { ThemePreset } from "@/lib/themes/types";
import { presetToStoreTheme } from "@/lib/themes/to-store-theme";
import { productCardClassName } from "@/lib/themes/product-card-class";

export function ThemePreviewStorefront({ preset }: { preset: ThemePreset }) {
  const payload = presetToStoreTheme(preset);
  const vars = payload.css_variables;
  const style = Object.fromEntries(
    Object.entries(vars).map(([k, v]) => [k.startsWith("--") ? k : `--${k}`, v]),
  ) as CSSProperties;

  const cardClass = productCardClassName(preset.productCardStyle);

  return (
    <div
      className="theme-preview-root overflow-hidden rounded-2xl border border-zinc-200/80 bg-[var(--background)] shadow-lg dark:border-zinc-700"
      style={{
        ...style,
        background: vars.background ?? "#fafafa",
        color: vars.foreground ?? "#18181b",
        fontFamily: preset.typography.fontFamilyAr,
      }}
    >
      <div
        className={`relative h-24 overflow-hidden store-hero-${preset.heroStyle}`}
        style={{ "--primary": vars.primary, "--accent": vars.accent } as CSSProperties}
      >
        <div className="store-hero-motion absolute inset-0 opacity-90" aria-hidden />
        <div className="relative z-10 flex h-full flex-col justify-end p-3">
          <p className="text-[10px] font-bold text-white/80">معاينة المتجر</p>
          <p className="text-sm font-extrabold text-white drop-shadow">{preset.nameAr}</p>
        </div>
      </div>

      <div className="border-b border-[var(--border)] bg-[var(--card)] px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-white"
              style={{ background: vars.primary }}
            >
              د
            </div>
            <span className="text-xs font-bold text-[var(--foreground)]">متجر داسم</span>
          </div>
          <ShoppingBag className="h-4 w-4 text-[var(--primary-text,var(--primary))]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3">
        {[1, 2].map((n) => (
          <article key={n} className={cardClass}>
            <div className="store-product-card__media aspect-[4/5] bg-[var(--muted)]" />
            <div className="store-product-card__body space-y-1 p-2">
              <div className="h-2 w-4/5 rounded bg-[var(--muted)]" />
              <p className="text-xs font-bold" style={{ color: "var(--primary-text,var(--primary))" }}>
                199 ر.س
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
