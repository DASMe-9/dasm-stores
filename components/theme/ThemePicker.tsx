"use client";

import { Check } from "lucide-react";
import type { ThemeMarket, ThemePreset } from "@/lib/themes/types";
import { presetsByMarket } from "@/lib/themes";

const MARKET_TABS: { key: ThemeMarket | "all"; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "automotive", label: "سيارات ومحركات" },
  { key: "general", label: "تجزئة عامة" },
];

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
              <div className="mb-2 flex gap-1">
                <span
                  className="h-8 flex-1 rounded-lg"
                  style={{ background: preset.colors.primary }}
                />
                <span
                  className="h-8 w-10 rounded-lg"
                  style={{ background: preset.colors.accent }}
                />
              </div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{preset.nameAr}</p>
              <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{preset.nameEn}</p>
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
