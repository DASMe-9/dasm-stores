"use client";

/**
 * Beginner-first visual builder — the default Store Builder experience.
 * The merchant adds sections from a grouped library, reorders/hides/deletes/
 * edits them visually, tweaks global design, and sees an instant preview.
 * No code. Every mutation round-trips through parse -> serialize so the same
 * validation/sanitization applies and Advanced (code) mode stays in sync.
 */

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Eye,
  EyeOff,
  Monitor,
  Plus,
  RotateCcw,
  Settings2,
  Smartphone,
  Trash2,
} from "lucide-react";
import {
  BLOCK_SCHEMA,
  SECTION_GROUPS,
  SECTION_GROUP_LABEL_AR,
  SECTION_LIBRARY,
  parseBlocks,
  serializeBlocks,
  validateBlock,
} from "@/lib/themes/blocks";
import type { Block, BlockAttrValue, ThemeDesign } from "@/lib/themes/blocks";
import { BlockRenderer, type PreviewContext } from "./BlockRenderer";
import { SectionFieldEditor } from "./SectionFieldEditor";
import { DesignPanel } from "./DesignPanel";

type Device = "desktop" | "mobile";

export function VisualBuilder({
  source,
  onSourceChange,
  design,
  onDesignChange,
  ctx,
}: {
  source: string;
  onSourceChange: (next: string) => void;
  design: ThemeDesign;
  onDesignChange: (next: ThemeDesign) => void;
  ctx: PreviewContext;
}) {
  const blocks = useMemo(() => parseBlocks(source).blocks, [source]);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>("desktop");

  const commit = (next: Block[]) => onSourceChange(serializeBlocks(next));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length) return;
    const next = blocks.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    commit(next);
  };
  const remove = (id: string) => commit(blocks.filter((b) => b.id !== id));
  const toggleHidden = (id: string) =>
    commit(blocks.map((b) => (b.id === id ? { ...b, attrs: { ...b.attrs, hidden: b.attrs.hidden !== true } } : b)));
  const updateAttrs = (id: string, attrs: Record<string, BlockAttrValue>) =>
    commit(blocks.map((b) => (b.id === id ? { ...b, attrs } : b)));
  const resetSection = (id: string, type: Block["type"]) => {
    const fresh = validateBlock(type, {}, id);
    if (fresh) commit(blocks.map((b) => (b.id === id ? fresh : b)));
  };
  const addSnippet = (snippet: string) => {
    onSourceChange(`${source.trimEnd()}\n${snippet}\n`);
    setAddOpen(false);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
      {/* Left: sections + design */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">الأقسام</span>
            <button
              type="button"
              onClick={() => setAddOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
            >
              <Plus className="h-3 w-3" /> إضافة قسم
            </button>
          </div>

          {addOpen ? (
            <div className="max-h-64 overflow-y-auto border-b border-zinc-100 p-2 dark:border-zinc-800">
              {SECTION_GROUPS.map((group) => {
                const items = SECTION_LIBRARY.filter((s) => s.group === group);
                if (!items.length) return null;
                return (
                  <div key={group} className="mb-2">
                    <p className="px-1 py-1 text-[10px] font-bold text-zinc-400">{SECTION_GROUP_LABEL_AR[group]}</p>
                    <div className="flex flex-wrap gap-1">
                      {items.map((s) => (
                        <button
                          key={s.type + s.labelAr}
                          type="button"
                          onClick={() => addSnippet(s.snippet)}
                          className="rounded-lg border border-zinc-200 px-2 py-1 text-[11px] text-zinc-700 hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-300"
                        >
                          {s.labelAr}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {blocks.map((block, i) => {
              const spec = BLOCK_SCHEMA[block.type];
              const hidden = block.attrs.hidden === true;
              const open = editId === block.id;
              return (
                <li key={block.id} className="px-2 py-1.5">
                  <div className="flex items-center gap-1">
                    <span className={`min-w-0 flex-1 truncate text-xs font-semibold ${hidden ? "text-zinc-400 line-through" : "text-zinc-800 dark:text-zinc-200"}`}>
                      {spec.labelAr}
                    </span>
                    <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800" aria-label="أعلى">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => move(i, i + 1)} disabled={i === blocks.length - 1} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800" aria-label="أسفل">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => toggleHidden(block.id)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="إظهار/إخفاء">
                      {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button type="button" onClick={() => setEditId(open ? null : block.id)} className={`rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${open ? "text-emerald-600" : "text-zinc-400"}`} aria-label="تحرير">
                      <Settings2 className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => remove(block.id)} disabled={!spec.removable} title={spec.removable ? "حذف" : "قسم أساسي لا يُحذف"} className="rounded p-1 text-red-400 hover:bg-red-50 disabled:opacity-30 dark:hover:bg-red-950/40" aria-label="حذف">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {open ? (
                    <div className="mt-2 rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                      <SectionFieldEditor block={block} onChange={(attrs) => updateAttrs(block.id, attrs)} />
                      <button
                        type="button"
                        onClick={() => resetSection(block.id, block.type)}
                        className="mt-3 inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-[11px] font-semibold text-zinc-600 hover:bg-white dark:border-zinc-700 dark:text-zinc-300"
                      >
                        <RotateCcw className="h-3 w-3" /> إعادة القسم للافتراضي
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        <details className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" open>
          <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200">
            <ChevronDown className="h-3.5 w-3.5" /> ضوابط التصميم
          </summary>
          <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
            <DesignPanel design={design} onChange={onDesignChange} />
          </div>
        </details>
      </div>

      {/* Right: preview */}
      <div className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xs text-zinc-500">معاينة فورية</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setDevice("desktop")} className={`rounded p-1 ${device === "desktop" ? "bg-emerald-600 text-white" : "text-zinc-400"}`} aria-label="سطح المكتب">
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => setDevice("mobile")} className={`rounded p-1 ${device === "mobile" ? "bg-emerald-600 text-white" : "text-zinc-400"}`} aria-label="الجوال">
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className={`mx-auto overflow-hidden rounded-2xl border border-zinc-300 shadow-sm dark:border-zinc-700 ${device === "mobile" ? "max-w-sm" : "max-w-3xl"}`}>
            <BlockRenderer blocks={blocks} ctx={ctx} />
          </div>
        </div>
      </div>
    </div>
  );
}
