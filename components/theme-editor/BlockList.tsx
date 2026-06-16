"use client";

/**
 * Visual block list for non-technical owners: reorder by drag (or arrows) and
 * delete blocks without touching code. Every mutation runs through the same
 * parse → mutate → serialize round-trip, so the code pane and visual list stay
 * in sync and validation/sanitization still applies. navbar/footer are marked
 * non-removable in the schema and cannot be deleted.
 */

import { useMemo, useState } from "react";
import { GripVertical, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { BLOCK_SCHEMA, parseBlocks, serializeBlocks } from "@/lib/themes/blocks";
import type { Block, BlockAttrValue } from "@/lib/themes/blocks";

function summarize(attrs: Record<string, BlockAttrValue>): string {
  const first = ["title", "text", "about"].map((k) => attrs[k]).find((v) => typeof v === "string" && v);
  return typeof first === "string" ? first : "";
}

export function BlockList({
  source,
  onSourceChange,
}: {
  source: string;
  onSourceChange: (next: string) => void;
}) {
  const blocks = useMemo(() => parseBlocks(source).blocks, [source]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const commit = (next: Block[]) => onSourceChange(serializeBlocks(next));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length || from === to) return;
    const next = blocks.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    commit(next);
  };

  const remove = (index: number) => commit(blocks.filter((_, i) => i !== index));

  if (!blocks.length) {
    return <p className="px-3 py-4 text-center text-xs text-zinc-400">لا بلوكات — أضف من اللوحة بالأعلى.</p>;
  }

  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {blocks.map((block, i) => {
        const spec = BLOCK_SCHEMA[block.type];
        const summary = summarize(block.attrs);
        return (
          <li
            key={block.id}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) move(dragIndex, i);
              setDragIndex(null);
            }}
            className={`flex items-center gap-2 px-2 py-2 ${dragIndex === i ? "opacity-50" : ""}`}
          >
            <GripVertical className="h-4 w-4 cursor-grab text-zinc-300" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{spec.labelAr}</p>
              {summary ? <p className="truncate text-[11px] text-zinc-400">{summary}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => move(i, i - 1)}
              disabled={i === 0}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
              aria-label="تحريك لأعلى"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => move(i, i + 1)}
              disabled={i === blocks.length - 1}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
              aria-label="تحريك لأسفل"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={!spec.removable}
              title={spec.removable ? "حذف" : "بلوك أساسي لا يُحذف"}
              className="rounded p-1 text-red-400 hover:bg-red-50 disabled:opacity-30 dark:hover:bg-red-950/40"
              aria-label="حذف البلوك"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
