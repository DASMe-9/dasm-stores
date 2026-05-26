"use client";

import { Check } from "lucide-react";
import type { ThemeMarket, ThemePreset } from "@/lib/themes/types";
import { presetsByMarket } from "@/lib/themes";

const MARKET_TABS: { key: ThemeMarket | "all"; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "automotive", label: "سيارات ومحركات" },
  { key: "general", label: "تجزئة عامة" },
];

const marketLabel: Record<ThemeMarket, string> = {
  automotive: "سيارات",
  general: "تجزئة",
  mixed: "متنوع",
};

export function ThemePicker({
  selectedId,
  onSelect,
  marketFilter,
  onMarketFilterChange,
}: {
  selectedId: string | null;
  onSelect: (preset: ThemePreset) => void;
  marketFilter: ThemeMarket | "all";
  onMarketFilterChange: (m: ThemeMarket | "all") => void;
}) {
  const list = presetsByMarket(marketFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {MARKET_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onMarketFilterChange(tab.key)}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                marketFilter === tab.key
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {list.length} قالب
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((preset) => {
          const active = selectedId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              className={[
                "group relative rounded-2xl border p-3 text-right transition",
                active
                  ? "border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 dark:bg-emerald-950/30"
                  : "border-zinc-200 bg-white hover:border-emerald-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900",
              ].join(" ")}
            >
              {active ? (
                <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
              ) : null}
              <div className="mb-2 grid h-12 grid-cols-[1fr_2.5rem] gap-1 overflow-hidden rounded-xl border border-black/5 dark:border-white/10">
                <span
                  className="h-full"
                  style={{
                    background: `linear-gradient(135deg, ${preset.colors.primary}, ${preset.colors.background})`,
                  }}
                />
                <span
                  className="h-full"
                  style={{ background: preset.colors.accent }}
                />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">{preset.nameAr}</p>
                  <p className="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400">{preset.nameEn}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  {marketLabel[preset.market]}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-zinc-500">
                {preset.suitableFor.slice(0, 3).join(" · ")}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
