"use client";

import type { CSSProperties } from "react";
import { BadgeCheck, Search, ShoppingBag, Sparkles } from "lucide-react";
import type { ThemePreset } from "@/lib/themes/types";
import { presetToStoreTheme } from "@/lib/themes/to-store-theme";
import { productCardClassName } from "@/lib/themes/product-card-class";

export function ThemePreviewStorefront({ preset }: { preset: ThemePreset }) {
  const payload = presetToStoreTheme(preset);
  const vars = payload.css_variables;
  const background = preset.colors.background.replace("#", "");
  const backgroundTone = Number.parseInt(background.length === 3 ? background.repeat(2) : background, 16);
  const style = Object.fromEntries(
    Object.entries(vars).map(([k, v]) => [k.startsWith("--") ? k : `--${k}`, v]),
  ) as CSSProperties;

  const cardClass = productCardClassName(preset.productCardStyle);
  const isDarkSurface = Number.isFinite(backgroundTone) && backgroundTone < 0x555555;
  const previewProducts =
    preset.market === "automotive"
      ? ["منتج مميز", "وصول جديد", "خدمة معتمدة"]
      : ["مختار بعناية", "وصل حديثاً", "الأكثر طلباً"];
  const previewNav =
    preset.market === "automotive"
      ? ["المركبات", "العناية", "العروض"]
      : ["الجديد", "الأقسام", "الهدايا"];

  return (
    <div
      className="theme-preview-root overflow-hidden rounded-[1.35rem] border border-zinc-200/80 bg-[var(--background)] shadow-[0_18px_46px_rgba(15,23,42,0.10)] dark:border-zinc-700"
      style={{
        ...style,
        background: vars.background ?? "#fafafa",
        color: vars.foreground ?? "#18181b",
        fontFamily: preset.typography.fontFamilyAr,
      }}
    >
      <div
        className={`relative h-32 overflow-hidden store-hero-${preset.heroStyle}`}
        style={{ "--primary": vars.primary, "--accent": vars.accent } as CSSProperties}
      >
        <div className="store-hero-motion absolute inset-0 opacity-90" aria-hidden />
        <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between gap-2 rounded-full border border-white/15 bg-white/14 px-3 py-1.5 text-[9px] font-bold text-white shadow-sm backdrop-blur-md">
          <span>واجهة داسم</span>
          <span className="flex items-center gap-1">
            <BadgeCheck className="h-3 w-3" aria-hidden />
            مجاني
          </span>
        </div>
        <div className="relative z-10 flex h-full flex-col justify-end p-4">
          <div className="max-w-[15rem]">
            <p className="text-[10px] font-bold text-white/80">معاينة متجر احترافية</p>
            <p className="mt-1 text-base font-extrabold leading-tight text-white drop-shadow">
              {preset.nameAr}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-white/85">
              قالب مجاني مضمن · قابل للتخصيص
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--border)] bg-[var(--card)] px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[10px] font-bold text-white shadow-sm"
              style={{ background: vars.primary }}
            >
              د
            </div>
            <div>
              <span className="block text-xs font-bold text-[var(--foreground)]">متجر داسم</span>
              <span className="block text-[9px] font-semibold text-[var(--muted-foreground)]">
                تجربة منظمة وسريعة
              </span>
            </div>
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
              <div className="h-1.5 w-2/3 rounded-full bg-[var(--muted)]" />
            </div>
          </article>
        ))}
      </div>

      <div className="border-t border-[var(--border)] px-3 py-2">
        <div className="flex items-center justify-between gap-2 text-[9px] font-bold">
          <span className="text-[var(--muted-foreground)]">نسق جاهز بدون تكلفة إضافية</span>
          <span
            className="rounded-full px-2 py-1 text-white"
            style={{ background: vars.accent || vars.primary }}
          >
            {isDarkSurface ? "راقي" : "واضح"}
          </span>
        </div>
      </div>
    </div>
  );
}
