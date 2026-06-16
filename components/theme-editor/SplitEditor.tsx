"use client";

/**
 * Split-screen theme editor (Shopify-style): code/blocks on one side, live
 * preview on the other. Typing in the code pane re-renders the preview pane
 * instantly. A block palette inserts ready DSL; "restore default" returns to
 * the elegant baseline. The AI assist box is the Phase 3 seam (disabled here).
 */

import { useMemo } from "react";
import { AlertTriangle, Plus, RotateCcw, Smartphone, Sparkles } from "lucide-react";
import { BLOCK_SCHEMA, parseBlocks } from "@/lib/themes/blocks";
import type { BlockType } from "@/lib/themes/blocks";
import { BlockRenderer, type PreviewContext } from "./BlockRenderer";

const PALETTE: { type: BlockType; snippet: string }[] = [
  { type: "banner", snippet: `<banner text="عرض خاص لفترة محدودة" />` },
  { type: "hero", snippet: `<hero title="{{ store.name }}" subtitle="نبذة جذابة" cta="تسوّق الآن" style="aurora" />` },
  { type: "richtext", snippet: `<richtext title="عن المتجر" body="اكتب نبذتك هنا." />` },
  { type: "featured", snippet: `<featured title="مميزة" limit="4" />` },
  { type: "product-grid", snippet: `<product-grid title="كل المنتجات" cols="3" sort="newest" />` },
];

export function SplitEditor({
  source,
  onSourceChange,
  onRestoreDefault,
  ctx,
}: {
  source: string;
  onSourceChange: (next: string) => void;
  onRestoreDefault: () => void;
  ctx: PreviewContext;
}) {
  const { blocks, errors } = useMemo(() => parseBlocks(source), [source]);

  const insert = (snippet: string) => onSourceChange(`${source.trimEnd()}\n${snippet}\n`);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Code / blocks pane */}
      <section className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
          {PALETTE.map((p) => (
            <button
              key={p.type}
              type="button"
              onClick={() => insert(p.snippet)}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <Plus className="h-3 w-3" />
              {BLOCK_SCHEMA[p.type].labelAr}
            </button>
          ))}
          <button
            type="button"
            onClick={onRestoreDefault}
            className="ml-auto inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
          >
            <RotateCcw className="h-3 w-3" />
            استعادة الافتراضي
          </button>
        </div>

        <textarea
          dir="ltr"
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          spellCheck={false}
          className="flex-1 resize-none bg-white p-3 font-mono text-[12.5px] leading-6 text-zinc-800 outline-none dark:bg-zinc-900 dark:text-zinc-200"
          aria-label="محرّر بلوكات الثيم"
        />

        {errors.length ? (
          <div className="border-t border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {errors.slice(0, 3).map((er, i) => (
              <div key={i} className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                سطر {er.line}: {er.message}
              </div>
            ))}
          </div>
        ) : null}

        {/* Phase 3 AI seam — present in the design, disabled until wired to Haiku */}
        <div className="flex items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <input
            disabled
            placeholder="صف ما تريد بالعربية والذكاء يولّد البلوكات… (قريباً)"
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </section>

      {/* Live preview pane */}
      <section className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          <Smartphone className="h-3.5 w-3.5" />
          المعاينة المباشرة — {blocks.length} بلوك
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-zinc-300 shadow-sm dark:border-zinc-700">
            <BlockRenderer blocks={blocks} ctx={ctx} />
          </div>
        </div>
      </section>
    </div>
  );
}
