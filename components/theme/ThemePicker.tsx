"use client";

import { Check, Layers3 } from "lucide-react";
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
                "group relative overflow-hidden rounded-2xl border p-3 text-right transition",
                active
                  ? "border-emerald-500 bg-emerald-50/80 shadow-[0_16px_36px_rgba(16,185,129,0.16)] ring-2 ring-emerald-500/30 dark:bg-emerald-950/30"
                  : "border-zinc-200 bg-white hover:border-emerald-300 hover:shadow-[0_14px_34px_rgba(15,23,42,0.09)] dark:border-zinc-700 dark:bg-zinc-900",
              ].join(" ")}
            >
              <span
                className="pointer-events-none absolute inset-x-0 top-0 h-1"
                style={{
                  background: `linear-gradient(90deg, ${preset.colors.primary}, ${preset.colors.accent})`,
                }}
              />
              {active ? (
                <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
              ) : null}
              <div
                className="mb-3 rounded-xl border p-2"
                style={{
                  borderColor: preset.colors.border,
                  background: preset.colors.background,
                  color: preset.colors.foreground,
                }}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="h-2 w-16 rounded-full" style={{ background: preset.colors.primary }} />
                  <Layers3 className="h-3.5 w-3.5 opacity-60" aria-hidden />
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[0, 1, 2].map((item) => (
                    <span
                      key={item}
                      className="block aspect-[4/5] rounded-lg"
                      style={{
                        background:
                          item === 1
                            ? `linear-gradient(135deg, ${preset.colors.accent}, ${preset.colors.primary})`
                            : preset.colors.card,
                        border: `1px solid ${preset.colors.border}`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-2 flex gap-1">
                <span
                  className="h-3 flex-1 rounded-full"
                  style={{ background: preset.colors.primary }}
                />
                <span
                  className="h-3 w-10 rounded-full"
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
