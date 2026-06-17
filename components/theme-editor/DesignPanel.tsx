"use client";

/**
 * Design controls (Canva-style knobs). Every option is a fixed enum from
 * DESIGN_OPTIONS — never free CSS — so it can never become an execution sink.
 */

import { DESIGN_OPTIONS } from "@/lib/themes/blocks";
import type { ThemeDesign } from "@/lib/themes/blocks";

const LABELS: Record<string, string> = {
  background: "الخلفية",
  buttonStyle: "نمط الأزرار",
  cornerRadius: "انحناء الحواف",
  layoutWidth: "عرض التخطيط",
  productCardStyle: "بطاقة المنتج",
  font: "الخط",
  // option values
  light: "فاتحة",
  soft: "ناعمة",
  dark: "داكنة",
  solid: "ممتلئ",
  outline: "محدّد",
  pill: "دائري",
  sharp: "حاد",
  rounded: "مستدير",
  round: "دائري جداً",
  boxed: "محدود",
  full: "كامل",
  simple: "بسيط",
  modern: "عصري",
  premium: "فاخر",
  tajawal: "تجوال",
  cairo: "القاهرة",
  system: "النظام",
};

const tr = (v: string) => LABELS[v] ?? v;

export function DesignPanel({
  design,
  onChange,
}: {
  design: ThemeDesign;
  onChange: (next: ThemeDesign) => void;
}) {
  const set = <K extends keyof ThemeDesign>(key: K, value: ThemeDesign[K]) => onChange({ ...design, [key]: value });

  return (
    <div className="space-y-3">
      <label className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">لون الثيم</span>
        <input
          type="color"
          value={design.themeColor}
          onChange={(e) => set("themeColor", e.target.value)}
          className="h-7 w-12 cursor-pointer rounded border border-zinc-200 dark:border-zinc-700"
        />
      </label>

      {(Object.keys(DESIGN_OPTIONS) as (keyof typeof DESIGN_OPTIONS)[]).map((key) => (
        <label key={key} className="block">
          <span className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">{LABELS[key] ?? key}</span>
          <select
            value={design[key as keyof ThemeDesign] as string}
            onChange={(e) => set(key as keyof ThemeDesign, e.target.value as never)}
            className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
          >
            {DESIGN_OPTIONS[key].map((opt) => (
              <option key={opt} value={opt}>
                {tr(opt)}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
