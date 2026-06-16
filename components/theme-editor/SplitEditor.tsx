"use client";

/**
 * Split-screen theme editor (Shopify-style). Left: code OR visual block list,
 * plus a block palette and restore-default. Right: instant in-browser block
 * preview OR a real iframe preview of the published storefront. A surface
 * switcher toggles between the landing and products pages. The AI assist box
 * is the Phase 3 seam (disabled).
 */

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Code2,
  ExternalLink,
  LayoutList,
  Loader2,
  Plus,
  RotateCcw,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { BLOCK_SCHEMA, SURFACE_LABEL_AR, THEME_SURFACES, parseBlocks } from "@/lib/themes/blocks";
import type { BlockType, ThemeSurface } from "@/lib/themes/blocks";
import { BlockRenderer, type PreviewContext } from "./BlockRenderer";
import { BlockList } from "./BlockList";

const PALETTE: { type: BlockType; snippet: string }[] = [
  { type: "banner", snippet: `<banner text="عرض خاص لفترة محدودة" />` },
  { type: "hero", snippet: `<hero title="{{ store.name }}" subtitle="نبذة جذابة" cta="تسوّق الآن" style="aurora" />` },
  { type: "richtext", snippet: `<richtext title="عن المتجر" body="اكتب نبذتك هنا." />` },
  { type: "featured", snippet: `<featured title="مميزة" limit="4" />` },
  { type: "product-grid", snippet: `<product-grid title="كل المنتجات" cols="3" sort="newest" />` },
];

type EditMode = "code" | "visual";
type PreviewMode = "blocks" | "live";

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
        active
          ? "bg-emerald-600 text-white shadow"
          : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }`}
    >
      {children}
    </button>
  );
}

export function SplitEditor({
  source,
  onSourceChange,
  onRestoreDefault,
  ctx,
  activeSurface,
  onSurfaceChange,
  previewUrl,
  onGenerate,
}: {
  source: string;
  onSourceChange: (next: string) => void;
  onRestoreDefault: () => void;
  ctx: PreviewContext;
  activeSurface: ThemeSurface;
  onSurfaceChange: (surface: ThemeSurface) => void;
  previewUrl?: string;
  /** Phase 3: description -> blocks. Throws an Error (message shown) on failure. */
  onGenerate: (prompt: string) => Promise<void>;
}) {
  const { blocks, errors } = useMemo(() => parseBlocks(source), [source]);
  const [editMode, setEditMode] = useState<EditMode>("code");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("blocks");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const insert = (snippet: string) => onSourceChange(`${source.trimEnd()}\n${snippet}\n`);

  const runGenerate = async () => {
    const prompt = aiPrompt.trim();
    if (!prompt || aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      await onGenerate(prompt);
      setAiPrompt("");
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "تعذّر التوليد.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Surface switcher */}
      <div className="flex flex-wrap items-center gap-2">
        {THEME_SURFACES.map((s) => (
          <Tab key={s} active={activeSurface === s} onClick={() => onSurfaceChange(s)}>
            {SURFACE_LABEL_AR[s]}
          </Tab>
        ))}
        <span className="text-[11px] text-zinc-400">— صمّم كل سطح على حدة</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Code / visual pane */}
        <section className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
            <Tab active={editMode === "code"} onClick={() => setEditMode("code")}>
              <Code2 className="h-3.5 w-3.5" /> كود
            </Tab>
            <Tab active={editMode === "visual"} onClick={() => setEditMode("visual")}>
              <LayoutList className="h-3.5 w-3.5" /> بصري
            </Tab>
            <button
              type="button"
              onClick={onRestoreDefault}
              className="ml-auto inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
            >
              <RotateCcw className="h-3 w-3" />
              استعادة الافتراضي
            </button>
          </div>

          {editMode === "code" ? (
            <>
              <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
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
              </div>
              <textarea
                dir="ltr"
                value={source}
                onChange={(e) => onSourceChange(e.target.value)}
                spellCheck={false}
                className="flex-1 resize-none bg-white p-3 font-mono text-[12.5px] leading-6 text-zinc-800 outline-none dark:bg-zinc-900 dark:text-zinc-200"
                aria-label="محرّر بلوكات الثيم"
              />
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <BlockList source={source} onSourceChange={onSourceChange} />
            </div>
          )}

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

          {/* AI assist — description -> blocks (validated through the same pipeline) */}
          <div className="border-t border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") runGenerate();
                }}
                disabled={aiLoading}
                placeholder="صف ما تريد بالعربية والذكاء يولّد البلوكات…"
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] text-zinc-700 outline-none focus:border-emerald-400 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              />
              <button
                type="button"
                onClick={runGenerate}
                disabled={aiLoading || !aiPrompt.trim()}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                توليد
              </button>
            </div>
            {aiError ? <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{aiError}</p> : null}
          </div>
        </section>

        {/* Preview pane */}
        <section className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
            <Tab active={previewMode === "blocks"} onClick={() => setPreviewMode("blocks")}>
              <Smartphone className="h-3.5 w-3.5" /> معاينة البلوكات
            </Tab>
            <Tab active={previewMode === "live"} onClick={() => setPreviewMode("live")}>
              <ExternalLink className="h-3.5 w-3.5" /> المتجر الفعلي
            </Tab>
            <span className="ml-auto text-[11px] text-zinc-400">{blocks.length} بلوك</span>
          </div>

          {previewMode === "blocks" ? (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-zinc-300 shadow-sm dark:border-zinc-700">
                <BlockRenderer blocks={blocks} ctx={ctx} />
              </div>
            </div>
          ) : previewUrl ? (
            <iframe
              src={previewUrl}
              title="معاينة المتجر الفعلي"
              className="flex-1 w-full border-0 bg-white"
              sandbox="allow-same-origin allow-scripts"
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-zinc-400">
              انشر متجرك أولاً لعرض المعاينة الفعلية.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
