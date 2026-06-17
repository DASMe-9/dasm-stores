"use client";

/**
 * Free ready-made template gallery — the merchant's starting point. Picking a
 * template populates both surfaces + design (no code involved).
 */

import { Check } from "lucide-react";
import { STORE_TEMPLATES } from "@/lib/themes/blocks";
import type { StoreTemplate } from "@/lib/themes/blocks";

export function TemplateGallery({
  onApply,
  activeId,
}: {
  onApply: (template: StoreTemplate) => void;
  activeId?: string | null;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {STORE_TEMPLATES.map((t) => {
        const active = activeId === t.id;
        return (
          <div
            key={t.id}
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition dark:bg-zinc-900 ${
              active ? "border-emerald-500 ring-2 ring-emerald-500/30" : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <div
              className="flex h-24 items-end p-3"
              style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent}55)` }}
            >
              <span className="rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-bold text-zinc-800">{t.category}</span>
            </div>
            <div className="p-3">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.nameAr}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-zinc-500">{t.description}</p>
              <button
                type="button"
                onClick={() => onApply(t)}
                className={`mt-3 inline-flex w-full items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition ${
                  active
                    ? "bg-emerald-600 text-white"
                    : "border border-zinc-200 text-zinc-700 hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-200"
                }`}
              >
                {active ? <Check className="h-3.5 w-3.5" /> : null}
                {active ? "مُطبّق" : "تطبيق القالب"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
